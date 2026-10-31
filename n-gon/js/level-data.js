"use strict";
//local levels, levels saved as plain data instead of code, made in the level editor
//  levelData.play(data) builds one, level.load() calls it for local level names
//  levelData.store saves them in localStorage
//  levelData.capture(name) turns a written level into data, so the editor can start from it
//see docs/level-editor.md for the data format
const levelData = {
    format: 1, //bump when old data can't be read anymore, then convert it in levelData.normalize()
    nameMax: 40,

    //*********************************************************************
    // level data
    //*********************************************************************
    blank(name) { //enter and exit 1000 apart on one piece of ground
        return levelData.normalize({
            name,
            elements: [
                levelElements.create("spawn", { x: 0, y: -50 }),
                levelElements.create("exit", { x: 950, y: -30 }),
                levelElements.create("map", { x: -250, y: 0, width: 1500, height: 100 }),
            ],
        })
    },
    normalize(data) { //fills in anything missing, so the rest of the code can trust the data
        data.format = levelData.format
        data.name = String(data.name || "untitled")
        const defaults = levelElements.level.defaults()
        for (const key of Object.keys(defaults)) {
            if (data[key] === undefined || data[key] === null || data[key] === "") data[key] = defaults[key]
        }
        data.zoom = Number(data.zoom) || defaults.zoom
        data.elements = Array.isArray(data.elements) ? data.elements.filter(el => el && typeof el === "object") : []
        data.nextId = Math.max(Number(data.nextId) || 1, ...data.elements.map(el => (el.id || 0) + 1))
        for (const el of data.elements) {
            if (!el.id) el.id = data.nextId++
            levelElements.fillDefaults(el)
        }
        for (const type of levelElements.groups.core) { //every level needs a spawn and an exit
            if (!data.elements.some(el => el.type === type)) levelData.add(data, levelElements.create(type))
        }
        return data
    },
    add(data, el) {
        el.id = data.nextId++
        data.elements.push(el)
        return el
    },
    find(data, id) {
        return data.elements.find(el => el.id === id)
    },
    copy(data) {
        return JSON.parse(JSON.stringify(data))
    },
    fallHeight(data) { //falling this far below the lowest part of the level sends the player back to the start
        let bottom = 0
        for (const el of data.elements) {
            const b = levelElements.bounds(el)
            if (b.y + b.height > bottom) bottom = b.y + b.height
        }
        return Math.max(3000, bottom + 1500)
    },

    //*********************************************************************
    // names, local levels share names with written levels in level.levels and the level pool
    //*********************************************************************
    isValidName(name) {
        return typeof name === "string" && name.length <= levelData.nameMax && /^[A-Za-z][\w-]*$/.test(name)
    },
    isWrittenLevel(name) {
        return typeof level.maps[name] === "function" || typeof moreLevels[name] === "function" ||
            level.communityLevels.includes(name) || level.trainingLevels.includes(name)
    },
    isNameFree(name) {
        return levelData.isValidName(name) && !levelData.isWrittenLevel(name) && !levelData.store.has(name)
    },
    freeName(base) { //base, base2, base3, ...
        base = String(base).replace(/[^\w-]/g, "").slice(0, levelData.nameMax - 3)
        if (!/^[A-Za-z]/.test(base)) base = "level" + base
        if (levelData.isNameFree(base)) return base
        for (let i = 2; ; i++) {
            if (levelData.isNameFree(base + i)) return base + i
        }
    },

    //*********************************************************************
    // playing, builds data into the world, each element's runtime remembers what it made so the editor can rebuild one at a time
    //*********************************************************************
    data: null, //the level being played
    isEditor: false,
    isSpawning: true, //mobs and power ups spawn when the level loads, in the editor only when spawn is on
    runtimes: new Map(), //element id: { custom, top, maps, bodies, cons, consBB, composite, constraints, error }
    play(data, options = {}) { //call inside level.start, like a written level, see level.load(), options: { isEditor, isSpawning }
        levelData.data = data
        levelData.isEditor = !!options.isEditor
        levelData.isSpawning = !levelData.isEditor || !!options.isSpawning
        levelData.unbuildAll() //clearMap already removed the last level's bodies, but not constraints in the world, like a spinner's pin
        levelData.runtimes = new Map()
        levelData.applySettings(data)
        for (const el of levelData.inBuildOrder(data)) levelData.runtimes.set(el.id, levelData.build(el, false))
        if (levelData.isSpawning && spawn.randomMobPositions.length) spawn.randomMobFromArray() //mob spots, level.start() empties the list
        if (data.lineOfSight) simulation.draw.lineOfSightPrecalculation() //now that the map is built
        if (levelData.isSpawning && data.elements.some(el => levelElements.groups.mob.includes(el.type))) powerUps.addResearchToLevel() //like written levels, after the mobs spawn
        simulation.fallHeight = levelData.fallHeight(data)
        level.custom = () => levelData.layer("custom")
        level.customTopLayer = () => levelData.layer("top")
        if (!levelData.isEditor) simulation.zoomTransition(data.zoom)
    },
    applySettings(data) { //the level properties, simulation.clearMap() sets them back for the next level
        level.defaultZoom = data.zoom
        document.body.style.backgroundColor = data.background
        color.map = data.mapColor
        color.block = data.blockColor
        simulation.g = simulation.gDefault * data.gravity
        level.fallMode = data.fall === "sky" ? "start" : ""
        levelData.updateSight(data)
    },
    drawSight() { //shaded line of sight like the setting, its own function so the setting doesn't turn it off at each level start
        simulation.draw.drawMapSight(true)
    },
    updateSight(data) {
        const sight = levelData.drawSight
        if (data.lineOfSight) {
            simulation.draw.drawMapPath = sight
            if (map.length) simulation.draw.lineOfSightPrecalculation() //play() does it again after the map is built
        } else if (simulation.draw.drawMapPath === sight) {
            simulation.draw.drawMapPath = simulation.draw.drawMapPathDefault
            simulation.draw.updateLineOfSightSetting() //back to the player's setting
        }
    },
    inBuildOrder(data) { //spawn first, other elements can use the player's position, mobs and power ups last, they land on the map
        const order = levelElements.buildOrder
        const rank = el => {
            const group = levelElements.types[el.type]?.group
            return group ? order.indexOf(group) : order.length
        }
        return data.elements.slice().sort((a, b) => rank(a) - rank(b)) //sort keeps the list order inside each group
    },
    layer(name) { //runs each element's custom or top, in the order the elements are listed
        const isTimed = levelData.isEditor //the editor's analysis shows what each element costs a frame, runtime.customMs and runtime.topMs
        for (const el of levelData.data.elements) {
            const runtime = levelData.runtimes.get(el.id)
            if (!runtime || !runtime[name]) continue
            const start = isTimed ? performance.now() : 0
            try {
                runtime[name]()
            } catch (error) { //one broken element shouldn't stop the level
                runtime[name] = null
                runtime.error = error
                console.error(`${el.type} #${el.id}:`, error)
            }
            if (isTimed) runtime[name + "Ms"] = 0.97 * (runtime[name + "Ms"] || 0) + 0.03 * (performance.now() - start) //averaged, a single frame's time is too coarse
        }
    },
    build(el, isLive) { //isLive: the level has already started, so map bodies are added to the world here instead of in level.addToWorld()
        const type = levelElements.types[el.type]
        if (!type) return { error: new Error(`unknown element type: ${el.type}`) }
        const start = { map: map.length, body: body.length, cons: cons.length, consBB: consBB.length, composite: composite.length, constraints: engine.world.constraints.length }
        let runtime
        try {
            runtime = type.build(el, { isLive, isEditor: levelData.isEditor, isSpawning: levelData.isSpawning && !isLive }) || {}
        } catch (error) {
            runtime = { error }
            console.error(`${el.type} #${el.id}:`, error)
        }
        //anything added while building belongs to this element, so the level.* helpers can be used as they are
        runtime.maps = map.slice(start.map)
        runtime.bodies = body.slice(start.body)
        runtime.cons = cons.slice(start.cons)
        runtime.consBB = consBB.slice(start.consBB)
        runtime.composite = composite.slice(start.composite)
        runtime.constraints = engine.world.constraints.slice(start.constraints)
        if (isLive) {
            for (const who of runtime.maps) { //like level.addToWorld()
                who.collisionFilter.category = cat.map
                who.collisionFilter.mask = cat.player | cat.map | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet
                Matter.Body.setStatic(who, true)
                Composite.add(engine.world, who)
            }
        }
        return runtime
    },
    unbuild(runtime) {
        if (!runtime) return
        const removeFrom = (list, who) => {
            const index = list.indexOf(who)
            if (index !== -1) list.splice(index, 1)
        }
        for (const who of runtime.bodies.concat(runtime.maps)) {
            if (m.holdingTarget === who) m.drop()
            if (lastTouchedBlock === who) lastTouchedBlock = null
            Composite.remove(engine.world, who)
            removeFrom(body, who)
            removeFrom(map, who)
        }
        for (const who of runtime.cons) removeFrom(cons, who)
        for (const who of runtime.consBB) removeFrom(consBB, who)
        for (const who of runtime.composite) removeFrom(composite, who)
        for (const who of runtime.cons.concat(runtime.consBB, runtime.composite, runtime.constraints)) Composite.remove(engine.world, who)
        if (runtime.remove) runtime.remove()
    },
    rebuild(ids) { //rebuild elements after they change, ids that aren't in the data anymore are just removed, "all" rebuilds everything
        const data = levelData.data
        if (ids === "all") ids = [...new Set([...levelData.runtimes.keys(), ...data.elements.map(el => el.id)])]
        let isMapChanged = false
        for (const id of ids) {
            const old = levelData.runtimes.get(id)
            if (old) {
                if (old.maps.length) isMapChanged = true
                levelData.unbuild(old)
                levelData.runtimes.delete(id)
            }
            const el = levelData.find(data, id)
            if (!el) continue
            const runtime = levelData.build(el, true)
            if (runtime.maps.length) isMapChanged = true
            levelData.runtimes.set(id, runtime)
        }
        simulation.fallHeight = levelData.fallHeight(data)
        if (isMapChanged) {
            simulation.draw.setPaths()
            if (simulation.draw.drawMapPath === levelData.drawSight) simulation.draw.lineOfSightPrecalculation() //setPaths only does it for the line of sight setting
        }
    },
    unbuildAll() {
        for (const runtime of levelData.runtimes.values()) levelData.unbuild(runtime)
        levelData.runtimes = new Map()
    },
    runtimeContains(id, point) { //the element's bodies, blocks can be pushed away from where they start
        const runtime = levelData.runtimes.get(id)
        if (!runtime) return false
        return Matter.Query.point(runtime.maps.concat(runtime.bodies), point).length > 0
    },

    //*********************************************************************
    // code, the level written as a level.maps function, to paste into js/level.js
    //*********************************************************************
    functionName(name) { //my-level to myLevel
        return name.replace(/[-_]+(\w)/g, (match, letter) => letter.toUpperCase()).replace(/\W/g, "")
    },
    code(data) {
        const groups = {}
        const counts = {}
        const custom = []
        const top = []
        const together = new Map() //types with codeAll(elements) write all their elements at once, like mob spots in one list
        for (const el of data.elements) {
            const type = levelElements.types[el.type]
            if (type && type.codeAll) {
                if (!together.has(type)) together.set(type, [])
                together.get(type).push(el)
                continue
            }
            if (!type || !type.code) continue
            counts[el.type] = (counts[el.type] || 0) + 1
            const lines = type.code(el, `${levelData.functionName(el.type)}${counts[el.type]}`)
            if (!groups[type.group]) groups[type.group] = []
            groups[type.group].push(...(lines.setup || []))
            custom.push(...(lines.custom || []))
            top.push(...(lines.top || []))
        }
        for (const [type, elements] of together) {
            if (!groups[type.group]) groups[type.group] = []
            groups[type.group].unshift(...type.codeAll(elements))
        }
        const indent = lines => lines.map(line => "    " + line)
        const fallHeight = levelData.fallHeight(data)
        const name = levelData.functionName(data.name)
        return [
            `${name}() { //made in the level editor, paste it into level.maps in js/level.js and add "${name}" to level.playableLevels`,
            ...indent([
                ...(groups.core || []),
                `level.defaultZoom = ${data.zoom}`,
                "simulation.zoomTransition(level.defaultZoom)",
                `document.body.style.backgroundColor = ${JSON.stringify(data.background)};`,
                ...(data.mapColor !== "#444" ? [`color.map = ${JSON.stringify(data.mapColor)};`] : []),
                ...(data.blockColor !== levelElements.level.defaults().blockColor ? [`color.block = ${JSON.stringify(data.blockColor)};`] : []),
                ...(data.gravity !== 1 ? [`simulation.g = simulation.gDefault * ${levelElements.args(data.gravity)} //clearMap sets it back for the next level`] : []),
                ...(data.fall === "sky" ? [`level.fallMode = "start"; //falling keeps going from the sky`] : []),

                ...(fallHeight !== 3000 ? [`simulation.fallHeight = ${fallHeight}`] : []),
                ...(groups.element || []),
                "",
                "level.custom = () => {",
                ...indent(custom),
                "};",
                "level.customTopLayer = () => {",
                ...indent(top),
                "};",
                "",
                ...(groups.shape || []),
                ...(groups.mob || []),
                ...(groups.powerUp || []),
                ...(groups.mob ? ["powerUps.addResearchToLevel() //needs to run after mobs are spawned"] : []),
                ...(data.lineOfSight ? ["simulation.draw.lineOfSightPrecalculation() //walls block the view, after the map is made", "simulation.draw.drawMapPath = () => simulation.draw.drawMapSight(true)"] : []),
            ]),
            "},",
        ].join("\n").replace(/^\s+$/gm, "")
    },

    //*********************************************************************
    // capture, runs a written level's code and reads the map and blocks it made
    // only geometry comes through, movers, buttons, and anything in level.custom become plain map and blocks, mobs and power ups are left out
    //*********************************************************************
    capture(name) { //call while a level is running, then restart the level with simulation.clearNow, which clears out what the written level made
        levelData.clearWorld()
        const ephemera = simulation.ephemera.slice()
        const isHorizontalFlipped = simulation.isHorizontalFlipped
        let data
        try {
            simulation.isHorizontalFlipped = false
            level.load(name)
            data = levelData.fromWorld(name)
        } finally {
            simulation.isHorizontalFlipped = isHorizontalFlipped
            simulation.ephemera = ephemera //effects the level started, like mirrors and zooming
            level.custom = () => { }
            level.customTopLayer = () => { }
            simulation.draw.body = simulation.draw.bodyDefault //community levels can draw blocks their own way
            simulation.clearTimeouts() //anything the level planned to do later
            input.isPauseKeyReady = true //in case its timeout was cleared
        }
        return data
    },
    clearWorld() { //removes everything in the level, the player stays
        m.drop()
        levelData.unbuildAll()
        for (const list of [map, body, mob, powerUp, cons, consBB, composite]) {
            for (const who of list) Composite.remove(engine.world, who)
        }
        map = []
        body = []
        mob = []
        powerUp = []
        cons = []
        consBB = []
        composite = []
        lastTouchedBlock = null
    },
    fromWorld(name) { //the level the written code just built, as data
        const round = n => Math.round(n * 1000) / 1000
        const shape = (who) => { //the body's own vertices, a concave spawn.mapVertex is already its convex hull, see levelElements.checkPoints()
            const v = who.vertices
            const isRect = v.length === 4 && v.every((p, i) => {
                const next = v[(i + 1) % 4]
                return Math.abs(p.x - next.x) < 0.01 || Math.abs(p.y - next.y) < 0.01
            })
            if (isRect) return { x: round(who.bounds.min.x), y: round(who.bounds.min.y), width: round(who.bounds.max.x - who.bounds.min.x), height: round(who.bounds.max.y - who.bounds.min.y) }
            return { x: round(who.position.x), y: round(who.position.y), vertices: v.map(p => [round(p.x - who.position.x), round(p.y - who.position.y)]) }
        }
        const elements = [
            levelElements.create("spawn", { x: round(m.spawnPos.x), y: round(m.spawnPos.y), bump: false }), //written levels make their own bumps, they come through as map
            levelElements.create("exit", { x: round(level.exit.x), y: round(level.exit.y), bump: false }),
        ]
        for (const who of map) {
            if (!who.isSensor) elements.push(levelElements.create("map", { ...shape(who), friction: round(who.friction), restitution: round(who.restitution) }))
        }
        for (const who of body) {
            if (who.isSensor) continue
            if (who.isStatic) { //doors and platforms that don't fall
                elements.push(levelElements.create("map", { ...shape(who), friction: round(who.friction), restitution: round(who.restitution) }))
            } else {
                elements.push(levelElements.create("block", { ...shape(who), density: who.density, friction: round(who.friction), frictionAir: who.frictionAir, restitution: round(who.restitution) }))
            }
        }
        for (const el of elements) {
            if (el.vertices) { //rect defaults don't belong on shapes
                delete el.width
                delete el.height
            }
        }
        return levelData.normalize({
            name: levelData.freeName(name + "-copy"),
            zoom: level.defaultZoom,
            background: document.body.style.backgroundColor || "#ddd",
            mapColor: color.map,
            elements,
        })
    },

    //*********************************************************************
    // storage, each level is its own localStorage key, so saving one doesn't rewrite the others
    // if localStorage is blocked, levels last until the page closes
    //*********************************************************************
    store: {
        prefix: "localLevel:",
        indexKey: "localLevels", //{ names: [], recent: "" }
        levels: null, //name: data, loaded on first use
        recent: "", //the level the editor opened last
        quota: 5000000, //characters, about what browsers allow each site in localStorage, there's no way to ask for the real limit
        used() { //characters in localStorage, local levels share it with settings and checkpoints
            let total = 0
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    total += key.length + (localStorage.getItem(key) || "").length
                }
            } catch (error) { }
            return total
        },
        read(key) {
            try {
                return JSON.parse(localStorage.getItem(key))
            } catch (error) {
                return null
            }
        },
        write(key, value) {
            try {
                if (value === null) {
                    localStorage.removeItem(key)
                } else {
                    localStorage.setItem(key, JSON.stringify(value))
                }
            } catch (error) {
                console.warn("local level not saved", error)
            }
        },
        load() {
            if (levelData.store.levels) return
            levelData.store.levels = {}
            const index = levelData.store.read(levelData.store.indexKey) || {}
            for (const name of Array.isArray(index.names) ? index.names : []) {
                const data = levelData.store.read(levelData.store.prefix + name)
                if (data && levelData.isValidName(name)) levelData.store.levels[name] = levelData.normalize({ ...data, name })
            }
            levelData.store.recent = index.recent in levelData.store.levels ? index.recent : ""
            levelData.store.sync()
        },
        sync() { //written in level.localMaps, so level.load(), level.localLevels(), and the level pool see them
            for (const name of Object.keys(level.localMaps)) {
                if (!(name in levelData.store.levels)) delete level.localMaps[name]
            }
            for (const name of Object.keys(levelData.store.levels)) {
                level.localMaps[name] = () => levelData.play(levelData.store.get(name))
            }
        },
        saveIndex() {
            levelData.store.write(levelData.store.indexKey, { names: Object.keys(levelData.store.levels), recent: levelData.store.recent })
        },
        names() {
            levelData.store.load()
            return Object.keys(levelData.store.levels)
        },
        has(name) {
            levelData.store.load()
            return Object.hasOwn(levelData.store.levels, name)
        },
        get(name) { //a copy, so playing or editing it doesn't change what's saved
            levelData.store.load()
            return levelData.store.has(name) ? levelData.copy(levelData.store.levels[name]) : null
        },
        getRecent() {
            levelData.store.load()
            return levelData.store.recent ? levelData.store.get(levelData.store.recent) : null
        },
        save(data, isRecent = true) {
            levelData.store.load()
            const isNew = !levelData.store.has(data.name)
            levelData.store.levels[data.name] = levelData.copy(data)
            levelData.store.write(levelData.store.prefix + data.name, data)
            if (isRecent) levelData.store.recent = data.name
            if (isNew || isRecent) levelData.store.saveIndex()
            if (isNew) levelData.store.sync()
        },
        remove(name) {
            levelData.store.load()
            delete levelData.store.levels[name]
            levelData.store.write(levelData.store.prefix + name, null)
            if (levelData.store.recent === name) levelData.store.recent = ""
            levelData.store.saveIndex()
            levelData.store.sync()
            levelData.store.renameInPool(name, null)
        },
        rename(oldName, newName) {
            const data = levelData.store.get(oldName)
            if (!data || !levelData.isNameFree(newName)) return false
            data.name = newName
            delete levelData.store.levels[oldName]
            levelData.store.write(levelData.store.prefix + oldName, null)
            if (levelData.store.recent === oldName) levelData.store.recent = newName
            levelData.store.save(data, levelData.store.recent === newName)
            levelData.store.saveIndex()
            levelData.store.sync()
            levelData.store.renameInPool(oldName, newName)
            return true
        },
        renameInPool(oldName, newName) { //the level pool in settings remembers local levels by name, null takes it out
            const pool = localSettings.levelPool
            if (!pool || !pool.added.includes(oldName)) return
            pool.added = pool.added.filter(name => name !== oldName)
            if (newName) pool.added.push(newName)
            if (localSettings.isAllowed) localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update local storage
        },
    },
}
levelData.store.load()
