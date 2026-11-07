"use strict";
//local levels, levels saved as plain data instead of code, made in the level editor
//  levelData.play(data) builds one, level.load() calls it for local level names
//  levelData.store saves them in localStorage
//  authoring and capture live in level-editor-data.js, loaded only by the editor
//see docs/level-editor.md for the data format
const levelData = {
    format: 1, //bump when old data can't be read anymore, then convert it in levelData.normalize()
    nameMax: 40,

    //*********************************************************************
    // level data
    //*********************************************************************
    blank(name) { //entrance and exit 1000 apart on one piece of ground
        return levelData.normalize({
            name,
            elements: [
                levelElements.create("spawn", { x: 0, y: -50 }),
                levelElements.create("exit", { x: 950, y: -20 }),
                levelElements.create("map", { x: -250, y: 0, width: 1500, height: 100 }),
            ],
        })
    },
    normalize(data) { //fills in anything missing, so the rest of the code can trust the data
        if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("expected level data")
        delete data.lineOfSight //retired editor setting; the game keeps its own line-of-sight setting
        data.format = levelData.format
        data.name = String(data.name || "untitled")
        const defaults = levelElements.level.defaults()
        for (const key of Object.keys(defaults)) {
            if (data[key] === undefined || data[key] === null || data[key] === "") data[key] = defaults[key]
        }
        data.zoom = Number(data.zoom) || defaults.zoom
        if (typeof data.levelCode !== "string") data.levelCode = "" //the level info box's code, see runLevelCode()
        for (const key of ["author", "log"]) if (typeof data[key] !== "string") data[key] = "" //not in level.defaults(), the typical level properties button keeps them
        if (!Array.isArray(data.mobVeto)) data.mobVeto = []
        data.elements = Array.isArray(data.elements) ? data.elements.filter(el => el && typeof el === "object" && typeof el.type === "string" && /^\w+$/.test(el.type)) : [] //a type is a name, the editor shows it
        const isId = id => Number.isSafeInteger(id) && id > 0 && id < Number.MAX_SAFE_INTEGER //ids are whole numbers, the editor shows them, so an imported level can't put html there
        const ids = new Set()
        data.nextId = isId(Number(data.nextId)) ? Number(data.nextId) : 1
        for (const el of data.elements) {
            if (!isId(el.id)) continue
            if (ids.has(el.id)) throw new Error(`duplicate element id #${el.id}`)
            ids.add(el.id)
            data.nextId = Math.max(data.nextId, el.id + 1)
        }
        for (const el of data.elements) {
            if (el.type === "decor") el.type = "fill" //its old name
            if (el.type === "timer") { //it's one of logic's gates now, its link and orLink are its inputs
                el.type = "logic"
                el.gate = "timer"
            }
            if (el.type === "bezier") levelData.bezierToPath(el) //the path's curves do it now
            if (!isId(el.id)) el.id = data.nextId++
            levelElements.fillDefaults(el)
            for (const key of levelElements.refKeys(el)) if (!isId(el[key])) el[key] = null
            if (el.type === "powerUp" && !levelElements.types.powerUp.names.includes(el.name)) el.name = "heal"
            if (el.type === "namedMob" && !levelElements.mobNames().includes(el.name)) el.name = "starter"
            if ("veto" in el && !Array.isArray(el.veto)) el.veto = []
            const point = value => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite)
            for (const key of ["vertices", "spots"]) {
                if (el[key] !== undefined && (!Array.isArray(el[key]) || !el[key].every(point))) throw new Error(`${el.type} #${el.id}: ${key} must be a list of coordinate pairs`)
            }
            if (el.vertices && el.vertices.length < (el.type === "path" ? 2 : 3)) throw new Error(`${el.type} #${el.id}: too few vertices`)
            if (el.handles !== undefined && (!Array.isArray(el.handles) || !el.handles.every(handle => handle == null || point(handle)))) throw new Error(`${el.type} #${el.id}: invalid curve handles`)
            if (el.layer === "back" || el.layer === "front") el.layer = el.layer === "back" ? "under player" : "over player" //their old names
            if (el.edited) levelData.normalizeEdited(el)
        }
        for (const type of levelElements.groups.core) { //every level needs a spawn and an exit, unless its code sets them, like a written level that picks a layout
            if (!data.elements.some(el => el.type === type) && !levelData.hasCode(data)) levelData.add(data, levelElements.create(type))
        }
        return data
    },
    normalizeEdited(el) { //edited code's names go into the javascript as variable and argument names, so each has to be a plain name, or an imported level could hide code where importing doesn't show it
        const isName = name => typeof name === "string" && /^[A-Za-z_$][\w$]*$/.test(name)
        const edited = el.edited
        if (typeof edited !== "object") return delete el.edited
        edited.text = String(edited.text ?? "") //importing shows it before it can run
        if (!isName(edited.name)) delete edited.name
        const names = edited.names && typeof edited.names === "object" ? edited.names : {}
        edited.names = Object.fromEntries(Object.entries(names).filter(([id, name]) => /^[1-9]\d*$/.test(id) && isName(name)))
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
    nameProblem(name) { //why a name can't be used, or ""
        if (!levelData.isValidName(name)) return `names use letters, numbers, - and _, no spaces, start with a letter, and are up to ${levelData.nameMax} long`
        if (levelData.isWrittenLevel(name)) return "that's the name of one of the game's levels"
        if (levelData.store.has(name)) return "another local level has that name"
        return ""
    },
    freeName(base) { //base, base2, base3, ...
        base = String(base).replace(/[^\w-]/g, "").slice(0, levelData.nameMax - 3)
        if (!/^[A-Za-z]/.test(base)) base = "level" + base
        if (levelData.isNameFree(base)) return base
        for (let i = 2; ; i++) {
            if (levelData.isNameFree(base + i)) return base + i
        }
    },

    bezierToPath(el) { //an older save's bezier, one curved line from x, y to x2, y2 bent by cx1, cy1 and cx2, cy2, as a path with two curved vertices
        const center = { x: (el.x + el.x2) / 2, y: (el.y + el.y2) / 2 }
        const path = { x: center.x, y: center.y, vertices: [[el.x - center.x, el.y - center.y], [el.x2 - center.x, el.y2 - center.y]], handles: [[el.cx1 - el.x, el.cy1 - el.y], [el.x2 - el.cx2, el.y2 - el.cy2]], closed: false, fill: "none" }
        for (const key of ["x2", "y2", "cx1", "cy1", "cx2", "cy2", "edited"]) delete el[key] //its edited code was written for a bezier
        Object.assign(el, path, { type: "path" })
    },

    //*********************************************************************
    // playing, builds data into the world, each element's runtime remembers what it made so the editor can rebuild one at a time
    //*********************************************************************
    data: null, //the level being played
    isEditor: false,
    isSpawning: true, //mobs and power ups spawn when the level loads, in the editor only when spawn is on
    elementsById: new Map(), //active level only, refreshed on play and edits before rebuilding
    indexElements(data) {
        levelData.elementsById = new Map(data.elements.map(el => [el.id, el]))
    },
    runtimes: new Map(), //element id: { custom, top, maps, bodies, cons, consBB, composite, constraints, error }
    play(data, options = {}) { //call inside level.start, like a written level, see level.load(), options: { isEditor, isSpawning }
        levelData.data = data
        levelData.indexElements(data)
        levelData.isEditor = !!options.isEditor
        levelData.isSpawning = !levelData.isEditor || !!options.isSpawning
        levelData.unbuildAll() //clearMap already removed the last level's bodies, but not constraints in the world, like a spinner's pin
        levelData.runtimes = new Map()
        levelData.applySettings(data)
        if (data.author.trim()) simulation.inGameConsole(levelData.authorLog(data)) //like community levels
        if (data.log.trim()) simulation.inGameConsole(levelData.safeHtml(data.log)) //the level's own message
        levelData.trackEphemera(() => { }) //the last level code's effects go away, like mirrors
        levelData.codeLayers = null
        levelData.codeError = null //the last level's error doesn't carry into this one
        levelData.drawnByCode = levelData.hasCode(data) || data.levelCode.trim() ? levelData.codeDraws(data) : {}
        if (levelData.hasCode(data)) {
            levelData.runCode(data)
        } else {
            for (const el of levelData.inBuildOrder(data)) levelData.runtimes.set(el.id, levelData.build(el, false))
        }
        const has = text => levelData.codeHas(data, text) //what the level's code already does itself
        if (levelData.isSpawning && data.elements.some(el => el.type === "mobSpot")) spawn.randomMobFromArray(data.mobVeto) //mob spots, level.start() empties the list
        if (levelData.isSpawning && levelData.addsResearch(data)) powerUps.addResearchToLevel() //like written levels, after the mobs spawn
        if (levelData.isSpawning && !has("announceText")) { //like written levels, the run's constraint below the entrance and the new mob types
            const text = levelData.constraintText(data)
            level.announceText(text.x, text.y, true)
            level.announceMobTypes()
        }
        simulation.fallHeight = levelData.fallHeight(data)
        levelData.runLevelCode(data)
        level.custom = () => {
            levelData.runCodeLayer("custom")
            levelData.layer("custom")
            levelData.runLevelCodeLayer("custom")
        }
        level.customTopLayer = () => {
            levelData.runCodeLayer("top")
            levelData.layer("top")
            levelData.runLevelCodeLayer("top")
        }
        if (!levelData.isEditor) simulation.zoomTransition(data.zoom)
    },
    //*********************************************************************
    // code elements, a level with code runs in its list order inside one function, like a written level
    //*********************************************************************
    addsResearch(data) { //a level with mobs gets a research power up, unless its code already adds one, so a puzzle level or a copy of reactor doesn't
        return data.elements.some(el => levelElements.groups.mob.includes(el.type)) && !levelData.codeHas(data, "addResearchToLevel")
    },
    hasCode(data) {
        return data.elements.some(el => levelElements.isCode(el))
    },
    codeText(data) { //all the level's own javascript: code elements and the level code
        return data.elements.filter(el => levelElements.isCode(el)).map(el => el.code).concat(data.levelCode || "").join("\n")
    },
    codeHas(data, text) {
        return levelData.codeText(data).includes(text)
    },
    codeDraws(data) { //door types the level's code draws itself, so their elements don't draw them again
        return { spawn: levelData.codeHas(data, "level.enter.draw"), exit: levelData.codeHas(data, "level.exit.drawAndCheck") }
    },
    codeParts(data) { //every piece of javascript the level runs, [{ where, code }]: code elements, elements with edited code, and the level code, importing asks before running any
        const parts = []
        for (const el of data.elements) {
            if (levelElements.isCode(el)) {
                if (String(el.code).trim()) parts.push({ where: `code #${el.id}`, code: String(el.code) })
            } else if (el.edited) {
                parts.push({ where: `${levelElements.nameOf(el.type)} #${el.id}, edited code`, code: String(el.edited.text) })
            }
        }
        if (String(data.levelCode || "").trim()) parts.push({ where: "level code", code: String(data.levelCode) })
        return parts
    },
    runsCode: data => levelData.codeParts(data).length > 0,
    riskyCode: /\b(?:localStorage|sessionStorage|indexedDB|localSettings|saveGame|levelData|cookie|fetch|XMLHttpRequest|WebSocket|sendBeacon|EventSource|location|eval|Function|constructor|globalThis|window|innerHTML|outerHTML|insertAdjacentHTML|createElement|import)\b/g,
    codeFlags(text) { //names in code worth a close look before running it: what it could use to change saves, reach the internet, or change the page, not a complete list
        return [...new Set(String(text).match(levelData.riskyCode) || [])]
    },
    withoutCode(data) { //a copy without its javascript: no code elements or level code, and edited elements go back to what their settings make
        const copy = levelData.copy(data)
        copy.elements = copy.elements.filter(el => !levelElements.isCode(el))
        for (const el of copy.elements) delete el.edited
        copy.levelCode = ""
        return levelData.normalize(copy) //a spawn and exit, if its code made them
    },
    //*********************************************************************
    // saved data, level code can read saves and settings but not change them
    // a level's javascript is made inside a function whose arguments are read-only stand-ins for localStorage, sessionStorage, and localSettings, and no indexedDB
    // only the level's own code sees them, so the game's own saving still works, even when level code calls it
    // the shared execution policy lives in level-code.js
    // it stops code that changes saves plainly, like a settings line in a community map, not code written to get around it, the import warning is for that
    //*********************************************************************
    codeFunction: (params, body) => levelCode.codeFunction(params, body),
    isSkipped: () => false, //the editor hides elements from its explorer by not building them while editing
    codeLayers: null, //{ custom, top } the level.custom and level.customTopLayer the level's code set
    drawnByCode: {}, //door types its code draws, see codeDraws()
    codeError: null,
    runCode(data) { //every element in order, code runs as written and the other elements build where they are in the list
        const marks = new Map()
        let chunk = null //the code element running, to blame for an error
        const api = {
            build(id) {
                const el = levelData.find(data, id)
                levelData.runtimes.set(id, levelData.build(el, false))
            },
            start(id) {
                chunk = id
                marks.set(id, levelData.mark())
            },
            end(id) {
                levelData.runtimes.set(id, { ...levelData.made(marks.get(id)), isCode: true })
                chunk = null
            },
        }
        const source = data.elements.map(el => levelElements.isCode(el) ? `__level.start(${el.id});\n${el.code}\n;__level.end(${el.id});` : `__level.build(${el.id});`).join("\n")
        level.custom = () => { }
        level.customTopLayer = () => { }
        levelData.codeError = null
        try {
            const spawned = { mob: mob.length, powerUp: powerUp.length }
            try {
                levelData.trackEphemera(() => levelData.codeFunction(["__level"], `"use strict";\n${source}`).call(level, api))
            } finally {
                if (!levelData.isSpawning) levelData.removeSpawned(spawned)
            }
        } catch (error) { //the elements after the error don't get made
            console.error(chunk ? `code #${chunk}:` : "level code:", error)
            levelData.codeError = error
            if (chunk) levelData.runtimes.set(chunk, { ...levelData.made(marks.get(chunk)), isCode: true, error })
        }
        levelData.codeLayers = { custom: level.custom, top: level.customTopLayer }
    },
    //*********************************************************************
    // level code, data.levelCode, the level info box's code, it runs last, after everything else is made, like the end of a written level
    // written like an element's edited code: setup lines, then //level.custom and //level.customTopLayer and their lines, which run each frame after the elements'
    //*********************************************************************
    levelCodeRuntime: null, //{ maps, bodies, ..., custom, top } what it made and its layers
    runLevelCode(data) { //an error while it runs is the level's code error
        if (levelData.levelCodeRuntime) levelData.unbuild(levelData.levelCodeRuntime)
        levelData.levelCodeRuntime = null
        if (!data.levelCode.trim()) return
        const start = levelData.mark()
        const spawned = { mob: mob.length, powerUp: powerUp.length }
        const before = new Set(simulation.ephemera)
        let layers = {}
        try {
            layers = levelData.editedFunction(data.levelCode).call(level) || {}
        } catch (error) {
            console.error("level code:", error)
            levelData.codeError = error
        } finally {
            levelData.codeEphemera.push(...simulation.ephemera.filter(effect => !before.has(effect))) //its effects go away when it runs again, like code elements'
            if (!levelData.isSpawning) levelData.removeSpawned(spawned)
        }
        levelData.levelCodeRuntime = { ...levelData.made(start), custom: layers.custom, top: layers.top }
    },
    runLevelCodeLayer(name) { //an error stops only that layer
        const runtime = levelData.levelCodeRuntime
        if (!runtime || !runtime[name]) return
        try {
            runtime[name]()
        } catch (error) {
            runtime[name] = null
            console.error(`level code ${name === "top" ? "customTopLayer" : "custom"}:`, error)
            levelData.codeError = error
            if (levelData.onError) levelData.onError()
        }
    },
    runCodeLayer(name) { //the level code's level.custom or customTopLayer, an error doesn't stop the level
        const layers = levelData.codeLayers
        if (!layers) return
        try {
            layers[name]()
        } catch (error) {
            const isNew = !levelData.codeError
            if (isNew) console.error(`level code ${name === "top" ? "customTopLayer" : "custom"}:`, error) //once, it would repeat every cycle
            levelData.codeError = error
            if (isNew && levelData.onError) levelData.onError()
        }
    },
    codeEphemera: [], //effects the level's code started, like mirrors, removed when it runs again
    trackEphemera(run) { //the editor runs a level's code again without changing levels, so its effects don't pile up
        simulation.ephemera = simulation.ephemera.filter(effect => !levelData.codeEphemera.includes(effect))
        const before = new Set(simulation.ephemera)
        try {
            run()
        } finally {
            levelData.codeEphemera = simulation.ephemera.filter(effect => !before.has(effect))
        }
    },
    removeSpawned(start) { //while editing, the mobs and power ups the level's code spawned go away, like the elements' don't spawn, its code can still use them
        const mobs = mob.slice(start.mob)
        for (const who of mobs.concat(powerUp.slice(start.powerUp))) Composite.remove(engine.world, who)
        mob.length = start.mob
        powerUp.length = start.powerUp
        const isGone = who => mobs.includes(who)
        consBB = consBB.filter(c => { //groups of mobs are held together
            const isMob = isGone(c.bodyA) || isGone(c.bodyB)
            if (isMob) Composite.remove(engine.world, c)
            return !isMob
        })
    },
    mark() { //how long the lists are, made() is what was added since
        return { map: map.length, body: body.length, cons: cons.length, consBB: consBB.length, composite: composite.length, constraints: engine.world.constraints.length }
    },
    made(start) {
        return {
            maps: map.slice(start.map),
            bodies: body.slice(start.body),
            cons: cons.slice(start.cons),
            consBB: consBB.slice(start.consBB),
            composite: composite.slice(start.composite),
            constraints: engine.world.constraints.slice(start.constraints),
        }
    },
    authorLog: data => `<strong>${levelData.escape(data.name)}</strong> by <span class='color-var'>${levelData.escape(data.author.trim())}</span>`, //what community levels log when they load, the author is plain text
    escape: text => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]), //plain text in html
    unescape: text => String(text).replace(/&(amp|lt|gt|quot|#39);/g, (all, name) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[name]),
    safeTag: /^<\/?(?:b|strong|i|em|u|s|br|span|sub|sup|small|code)(?:\s+(?:class|data-help)\s*=\s*(?:"[\w\s-]*"|'[\w\s-]*')|\s+style\s*=\s*(?:"[\w\s#%.,:;()-]*"|'[\w\s#%.,:;()-]*'))*\s*\/?>/i, //a formatting tag, with only class, data-help, or a plain style
    safeHtml(text) { //a log's html, it can't run javascript: formatting tags like <b>, <br>, and the game's color-var spans stay, any other < shows as text
        return String(text).replace(/<[^<]*/g, part => levelData.safeTag.test(part) ? part : `&lt;${part.slice(1)}`)
    },
    applySettings(data) { //the level properties, simulation.clearMap() sets them back for the next level
        level.defaultZoom = data.zoom
        document.body.style.backgroundColor = data.background
        color.map = data.mapColor
        color.block = data.blockColor
        simulation.g = simulation.gDefault * data.gravity
        level.fallMode = data.fall === "sky" ? "start" : ""
    },
    constraintText(data) { //where the run's constraint text shows, the level properties move it from the spawn
        const spawn = data.elements.find(el => el.type === "spawn") || { x: 0, y: 0 }
        return { x: spawn.x + data.constraintTextX, y: spawn.y + data.constraintTextY }
    },
    onError: null, //called when an element or the level's code throws while running, the editor recounts its issues
    linkInputs(el, depth = 0) { //[link, orLink]: true while that trigger is on, false while off, null without one
        const sourceState = id => {
            const from = levelData.elementsById.get(id)
            const runtime = from && levelElements.isLinkSource(from) && levelData.runtimes.get(from.id)
            if (!runtime) return null
            const own = runtime.linkOn ? runtime.linkOn() : levelElements.types[from.type].linkOn(from, runtime, depth) //edited code's own check, see buildEdited()
            if (levelElements.types[from.type].isGate) return own //its links are its inputs, not also on
            const above = depth < 8 ? levelData.linkState(from, depth + 1) : null //a link source linked to another is only on while both are, like a timer that only runs while a button is down
            return above === false ? false : own
        }
        return [el.link ? sourceState(el.link) : null, el.orLink ? sourceState(el.orLink) : null]
    },
    linkState(el, depth = 0) { //true while what el is linked to is on, false while off, null without one
        const [a, b] = levelData.linkInputs(el, depth)
        const state = a === null ? b : b === null ? a : a || b //linked to two, it's on while either is
        if (depth || state === null || !(el.delay > 0)) return state
        const runtime = levelData.runtimes.get(el.id) //its delay follows the link late, kept on its runtime so a rebuild starts it over
        if (!runtime) return state
        if (!runtime.delayLine) runtime.delayLine = level.delay(el.delay)
        return runtime.delayLine.state(state)
    },
    linkOn(el) { //linkState() for el, flipped if it runs while its link is off, null without one
        const state = levelData.linkState(el)
        if (state === null) return null
        return el.runs === "while off" ? !state : state
    },
    inBuildOrder(data) { //spawn first, other elements can use the player's position, mobs and power ups last, they land on the map
        if (levelData.hasCode(data)) return data.elements.slice() //code runs in order, see runCode()
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
            const type = levelElements.types[el.type]
            if (levelData.drawnByCode[el.type]) continue //the level's code draws it
            if ((el.link || el.orLink) && type.isLinkable && !type.handlesLink && levelData.linkOn(el) === false) continue //its button has it off
            const start = isTimed ? performance.now() : 0
            try {
                runtime[name]()
            } catch (error) { //one broken element shouldn't stop the level
                runtime[name] = null
                runtime.error = error
                console.error(`${el.type} #${el.id}:`, error)
                if (levelData.onError) levelData.onError() //the editor's issues count, an error while running comes after the last count
            }
            if (isTimed) runtime[name + "Ms"] = 0.97 * (runtime[name + "Ms"] || 0) + 0.03 * (performance.now() - start) //averaged, a single frame's time is too coarse
        }
    },
    build(el, isLive) { //isLive: the level has already started, so map bodies are added to the world here instead of in level.addToWorld()
        const type = levelElements.types[el.type]
        const start = levelData.mark()
        let runtime
        try {
            if (!type) throw new Error(`unknown element type: ${el.type}`)
            const options = { isLive, isEditor: levelData.isEditor, isSpawning: levelData.isSpawning && !isLive }
            runtime = levelData.isSkipped(el) ? {} : el.edited ? levelData.buildEdited(el, options) : type.build(el, options) || {} //hidden in the editor's explorer, or its edited code
        } catch (error) {
            runtime = { error }
            if (!error.isUnfinished) console.error(`${el.type} #${el.id}:`, error) //an unfinished element, like a constraint with no block yet, only shows in the inspector and the issues
        }
        Object.assign(runtime, levelData.made(start)) //anything added while building belongs to this element, so the level.* helpers can be used as they are
        if (isLive) {
            for (const who of runtime.maps) { //like level.addToWorld()
                who.collisionFilter.category = cat.map
                who.collisionFilter.mask = who.collisionMask ?? (cat.player | cat.map | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet)
                Matter.Body.setStatic(who, true)
                Composite.add(engine.world, who)
            }
        }
        return runtime
    },
    //*********************************************************************
    // edited code, an element's code changed in the editor's info box: el.edited = { name, text }
    // text is like the info box's code: setup lines, then //level.custom and //level.customTopLayer and their lines, name is the variable name it was written with
    // it runs instead of what the element's settings make, a link still turns it on and off, see levelElements.isCodeEditable()
    //*********************************************************************
    sectionsOf(text) { //{ setup, custom, top } lines
        const sections = { setup: [], custom: [], top: [] }
        let section = sections.setup
        for (const line of String(text).split("\n")) {
            if (line.trim().startsWith("//level.customTopLayer")) section = sections.top //anything after it on the line is a comment
            else if (line.trim().startsWith("//level.custom")) section = sections.custom
            else section.push(line)
        }
        return sections
    },
    sectionsText({ setup = [], custom = [], top = [] }) {
        const zones = levelData.zones
        const isHeaded = !(custom.length || top.length) || setup[0]?.trim().startsWith(zones.setup) //only code with a part that repeats says which part runs once
        return [...(isHeaded ? [] : [zones.setup]), ...setup, ...(custom.length ? [zones.custom, ...custom] : []), ...(top.length ? [zones.top, ...top] : [])].join("\n")
    },
    zones: { //the comment lines that start each part of edited code, the level code, and the info box's code, sectionsOf() reads the //level.custom and //level.customTopLayer at their start
        setup: "//runs once when the level starts",
        custom: "//level.custom: runs every game cycle", //drawn under the player
        top: "//level.customTopLayer: runs every game cycle", //drawn over the player
    },
    typeCode(el, name, context) { //an element's { setup, custom, top } for export: its edited code with its variable name now, and the names of the elements it names now, or what its type writes
        if (!el.edited) return levelElements.types[el.type].code(el, name, context)
        const renames = new Map()
        if (name && el.edited.name && name !== el.edited.name) renames.set(el.edited.name, name)
        for (const [id, old] of Object.entries(el.edited.names || {})) {
            const now = context && context.nameOf(Number(id))
            if (now && now !== old) renames.set(old, now)
        }
        const text = renames.size ? el.edited.text.replace(new RegExp(`\\b(${[...renames.keys()].join("|")})\\b`, "g"), old => renames.get(old)) : el.edited.text //all at once, so two names can swap
        return levelData.sectionsOf(text)
    },
    editedRefs(data, el) { //ids of the elements an element's code names: what its refs point at, like a door's button or a constraint's block, and what those buttons are linked to
        const ids = []
        const add = (id, depth) => {
            const other = id && levelData.find(data, id)
            if (!other || ids.includes(id) || depth > 8) return
            ids.push(id)
            if (levelElements.isLinkSource(other)) for (const key of ["link", "orLink"]) add(other[key], depth + 1)
        }
        for (const key of levelElements.refKeys(el)) add(el[key], 0)
        return ids
    },
    editedFunction(text, refNames = [], selfName = "") { //one function that runs the setup and returns the layers, making it throws a SyntaxError if the code can't be read, without running any of it
        //refNames are its arguments, the other elements its code names, selfName is the element's own variable, returned so a link source's code can be checked
        const { setup, custom, top } = levelData.sectionsOf(text)
        const layer = lines => lines.some(line => line.trim()) ? `() => {\n${lines.join("\n")}\n}` : "null"
        const self = selfName ? `, self: typeof ${selfName} === "undefined" ? undefined : ${selfName}` : ""
        return levelData.codeFunction(refNames, `"use strict";\n${setup.join("\n")}\nreturn { custom: ${layer(custom)}, top: ${layer(top)}${self} }`)
    },
    editedRef(id) { //what edited code gets for another element it names: a link source's object, looked up each time it's used since it can be rebuilt, or a block's body
        const other = levelData.find(levelData.data, id)
        if (other && levelElements.isLinkSource(other)) {
            const self = () => {
                const runtime = levelData.runtimes.get(id)
                return runtime && (runtime.self || runtime[other.type]) //like runtime.button, or its own edited code's
            }
            return new Proxy({}, {
                get(target, key) {
                    const who = self()
                    const value = who && who[key]
                    return typeof value === "function" ? value.bind(who) : value
                },
                set(target, key, value) {
                    const who = self()
                    if (who) who[key] = value
                    return true
                },
            })
        }
        const runtime = levelData.runtimes.get(id)
        return runtime ? runtime.bodies[0] || runtime.maps[0] : undefined
    },
    buildEdited(el, options) { //like a type's build(), its custom and top run each frame, mobs and power ups only spawn when they would
        const type = levelElements.types[el.type]
        if ((type?.group === "mob" || type?.group === "powerUp") && !options.isSpawning) return {}
        const refs = Object.entries(el.edited.names || {})
        const selfName = type?.linkOn && el.edited.name ? el.edited.name : ""
        const layers = levelData.editedFunction(el.edited.text, refs.map(([, name]) => name), selfName).call(level, ...refs.map(([id]) => levelData.editedRef(Number(id))))
        const runtime = { custom: layers.custom, top: layers.top }
        if (selfName) { //a link source, on when its code's object is, like button1.isUp is off
            const on = Function(selfName, `return ${type.linkCode(el, selfName).on}`)
            runtime.self = layers.self
            runtime.linkOn = () => layers.self === undefined ? null : !!on(layers.self)
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
        levelData.indexElements(data)
        if (ids === "all") ids = [...new Set([...levelData.runtimes.keys(), ...data.elements.map(el => el.id)])]
        const changed = new Set(ids) //constraints hold bodies, so they're rebuilt after what they hold
        for (const el of data.elements) {
            if (levelElements.types[el.type]?.rebuildWithRefs && levelElements.refKeys(el).some(key => changed.has(el[key]))) changed.add(el.id)
        }
        const elements = new Map(data.elements.map(el => [el.id, el]))
        const order = new Map(levelData.inBuildOrder(data).map((el, i) => [el.id, i]))
        ids = [...changed].sort((a, b) => (order.has(a) ? order.get(a) : -1) - (order.has(b) ? order.get(b) : -1)) //removed ones first
        let isMapChanged = false
        for (const id of ids) {
            const old = levelData.runtimes.get(id)
            if (old) {
                if (old.maps.length) isMapChanged = true
                levelData.unbuild(old)
                levelData.runtimes.delete(id)
            }
            const el = elements.get(id)
            if (!el) continue
            const runtime = levelData.build(el, true)
            if (runtime.maps.length) isMapChanged = true
            levelData.runtimes.set(id, runtime)
        }
        simulation.fallHeight = levelData.fallHeight(data)
        if (isMapChanged) simulation.draw.setPaths()
    },
    unbuildAll() {
        for (const runtime of levelData.runtimes.values()) levelData.unbuild(runtime)
        levelData.runtimes = new Map()
        if (levelData.levelCodeRuntime) levelData.unbuild(levelData.levelCodeRuntime)
        levelData.levelCodeRuntime = null
    },
    runtimeContains(id, point) { //the element's bodies, blocks can be pushed away from where they start
        const runtime = levelData.runtimes.get(id)
        if (!runtime) return false
        return Matter.Query.point(runtime.maps, point).length > 0 || Matter.Query.point(runtime.bodies, point).length > 0
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
        isFailing: false, //a write failed and hasn't worked since, storage is full or blocked, the editor warns until each key saves
        failedKeys: new Set(), //keys whose last write failed, a later small write working doesn't clear another key's failure
        onChange: null, //called after each write with isFailing, the editor's not saved warning
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
        write(key, value) { //true if it worked
            let isSaved = true
            try {
                if (value === null) {
                    localStorage.removeItem(key)
                } else {
                    localStorage.setItem(key, JSON.stringify(value))
                }
            } catch (error) {
                console.warn("local level not saved", error)
                isSaved = false
            }
            if (isSaved) levelData.store.failedKeys.delete(key)
            else levelData.store.failedKeys.add(key)
            levelData.store.isFailing = levelData.store.failedKeys.size > 0
            if (levelData.store.onChange) levelData.store.onChange(levelData.store.isFailing)
            return isSaved
        },
        load() {
            if (levelData.store.levels) return
            levelData.store.levels = {}
            const index = levelData.store.read(levelData.store.indexKey) || {}
            const names = Array.isArray(index.names) ? index.names.slice() : []
            try { //a level saved without its index, like after a rename whose index write failed, is still found
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)
                    if (key && key.startsWith(levelData.store.prefix) && !names.includes(key.slice(levelData.store.prefix.length))) names.push(key.slice(levelData.store.prefix.length))
                }
            } catch (error) { }
            for (const name of names) {
                const data = levelData.store.read(levelData.store.prefix + name)
                if (data && levelData.isValidName(name)) {
                    try {
                        levelData.store.levels[name] = levelData.normalize({ ...data, name })
                    } catch (error) {
                        console.warn(`couldn't read local level ${name}:`, error) //leave the original storage untouched for recovery
                    }
                }
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
        saveIndex() { //true if it saved
            return levelData.store.write(levelData.store.indexKey, { names: Object.keys(levelData.store.levels), recent: levelData.store.recent })
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
        save(data, isRecent = true) { //true if it reached localStorage, it's kept for this page either way
            levelData.store.load()
            const isNew = !levelData.store.has(data.name)
            levelData.store.levels[data.name] = levelData.copy(data)
            const isSaved = levelData.store.write(levelData.store.prefix + data.name, data)
            if (isRecent) levelData.store.recent = data.name
            if (isNew || isRecent) levelData.store.saveIndex()
            if (levelData.store.failedKeys.has("localSettings") && localSettings.isAllowed) levelData.store.write("localSettings", localSettings)
            if (isNew) levelData.store.sync()
            return isSaved && !levelData.store.isFailing
        },
        hasWork() { //a local level that's more than the blank one opening the editor saves, the title page shows its editor button
            return levelData.store.names().some(name => {
                if (!/^untitled\d*$/.test(name)) return true
                const data = levelData.store.levels[name]
                const blank = levelData.blank(name)
                return JSON.stringify(data) !== JSON.stringify(blank)
            })
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
        rename(oldName, newName) { //the new copy is saved before the old one goes, so a failed save loses nothing
            const data = levelData.store.get(oldName)
            if (!data || !levelData.isNameFree(newName)) return false
            data.name = newName
            if (!levelData.store.write(levelData.store.prefix + newName, data)) return false
            const recent = levelData.store.recent
            levelData.store.levels[newName] = data
            delete levelData.store.levels[oldName]
            if (recent === oldName) levelData.store.recent = newName
            if (!levelData.store.saveIndex()) { //the index still says the old name, undo it all and keep the old one
                levelData.store.levels[oldName] = levelData.store.levels[newName]
                levelData.store.levels[oldName].name = oldName
                delete levelData.store.levels[newName]
                levelData.store.recent = recent
                levelData.store.write(levelData.store.prefix + newName, null)
                return false
            }
            levelData.store.write(levelData.store.prefix + oldName, null) //only once the new name is saved and listed
            levelData.store.sync()
            levelData.store.renameInPool(oldName, newName)
            return true
        },
        renameInPool(oldName, newName) { //the level pool in settings remembers local levels by name, null takes it out
            const pool = localSettings.levelPool
            if (!pool || !pool.added.includes(oldName)) return
            pool.added = pool.added.filter(name => name !== oldName)
            if (newName) pool.added.push(newName)
            if (localSettings.isAllowed) levelData.store.write("localSettings", localSettings) //a pool failure must not interrupt an already saved rename or deletion
        },
    },
}
levelData.store.load()

//*********************************************************************
// the level editor before it opens, runs read isActive and the title page shows its button
// its files load the first time it opens, like level2.js, so a normal run never loads them
// js/level-editor.js adds the rest to this object, replacing open() and close()
//*********************************************************************
const levelEditor = {
    isActive: false, //level.start(), m.death(), m.takeDamage(), the autosave, and the mouse lock check it every run
    files: ["js/level-editor-data.js", "js/level-analysis.js", "js/level-editor.js", "js/level-editor-icons.js", "js/level-editor-help.js"], //js/level-editor-mob-pictures.js loads later, see loadMobPictures()
    filesPromise: null,
    isLoaded: false, //every file ran, js/level-editor.js replaces open() before the icons and help files run, so its open() waits for this
    loadedFiles: [], //a retry after a failed download only adds the rest, running js/level-analysis.js twice would declare levelAnalysis twice
    loadFiles() { //all at once, they run in this order
        if (levelEditor.isLoaded) return Promise.resolve()
        if (levelEditor.filesPromise) return levelEditor.filesPromise
        levelEditor.filesPromise = Promise.all(levelEditor.files.filter(src => !levelEditor.loadedFiles.includes(src)).map(src => new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = src
            script.async = false //in order, each adds to the one before
            script.onload = () => {
                levelEditor.loadedFiles.push(src)
                resolve()
            }
            script.onerror = () => {
                script.remove()
                reject(new Error(`failed to load ${src}`))
            }
            document.head.appendChild(script)
        }))).then(() => {
            levelEditor.isLoaded = true
        }).catch(error => {
            levelEditor.filesPromise = null
            throw error
        })
        return levelEditor.filesPromise
    },
    async open() {
        const stub = levelEditor.open
        try {
            await levelEditor.loadFiles()
        } catch (error) {
            return console.error(error)
        }
        if (levelEditor.open !== stub) levelEditor.open() //js/level-editor.js's
    },
    close() { }, //nothing is open before it loads
    updateSplashButton() { //the title page's editor button, once there are local levels
        const isShown = levelData.store.hasWork()
        document.body.classList.toggle("has-level-editor", isShown)
        document.getElementById("level-editor-splash-button").style.display = isShown && simulation.onTitlePage !== false ? "inline" : "none"
    },
}
