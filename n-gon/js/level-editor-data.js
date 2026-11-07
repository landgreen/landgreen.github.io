"use strict";
// Authoring only: export JavaScript and read/capture source. Loaded when the editor opens.
Object.assign(levelData, {
    authorLine: /^simulation\.inGameConsole\(`<strong>[^<`]*<\/strong> by <span class=['"]color-var['"]>([^<`]*)<\/span>`\)$/, //that line in a written level's source, capture() reads the author from it
    authorOf(source) { //the author a written level logs, or ""
        for (const line of levelData.scanLines(source)) {
            const match = (line.comment === -1 ? line.text : line.text.slice(0, line.comment)).trim().replace(/;$/, "").match(levelData.authorLine)
            if (match) return levelData.unescape(match[1].trim()) //html in the source, plain text in the level
        }
        return ""
    },
    functionName(name) { //my-level to myLevel
        return name.replace(/[-_]+(\w)/g, (match, letter) => letter.toUpperCase()).replace(/\W/g, "")
    },
    codeNames(data) { //each element's variable name, like door1, and the context code(el, name, context) gets
        const counts = {}
        const names = new Map() //element id: its variable name
        const codeText = levelData.codeText(data)
        for (const el of data.elements) {
            const type = levelElements.types[el.type]
            if (!type || !type.code || levelData.isTogether(el) || type.isCode) continue
            let name
            do { //not a name the level's code already uses
                counts[el.type] = (counts[el.type] || 0) + 1
                name = `${levelData.functionName(el.type)}${counts[el.type]}`
            } while (new RegExp(`\\b${name}\\b`).test(codeText))
            names.set(el.id, name)
        }
        const referenced = new Set(data.elements.flatMap(el => levelElements.refKeys(el).map(key => el[key])).filter(id => names.has(id)))
        const codeOf = (id, depth) => {
            const from = levelData.find(data, id)
            if (!from || !levelElements.isLinkSource(from)) return null
            const own = levelElements.types[from.type].linkCode(from, names.get(from.id), context, depth)
            if (levelElements.types[from.type].isGate) return own //its links are its inputs, not also on
            const above = depth < 8 ? sourceCode(from, depth + 1) : null
            if (!above) return own
            const on = `${own.on} && ${above.on.includes("||") ? `(${above.on})` : above.on}`
            return { on, off: `!(${on})` }
        }
        const sourceCode = (el, depth) => { //{ on, off } for what el is linked to, a link source's own link has to be on too, and its orLink is either one
            const a = el.link ? codeOf(el.link, depth) : null
            const b = el.orLink ? codeOf(el.orLink, depth) : null
            if (!a || !b) return a || b
            const on = `${a.on} || ${b.on}`
            return { on, off: `!(${on})` }
        }
        const context = { //for code(el, name, context)
            data,
            nameOf: id => names.get(id),
            isReferenced: id => referenced.has(id),
            inputs: (el, depth) => depth < 8 ? [el.link, el.orLink].map(id => id ? codeOf(id, depth) : null).filter(Boolean).map(code => code.on) : [], //a gate's inputs, each one's on, depth stops gates linked in a loop
            link(el) { //javascript for when el is on and off, from the trigger it's linked to, and what that's linked to
                let code = sourceCode(el, 0)
                if (!code) return null
                if (el.delay > 0) { //exportElement() declares its delay
                    const on = `${names.get(el.id)}Delay.state(${code.on})`
                    code = { on, off: `!${on}` }
                }
                return el.runs === "while off" ? { on: code.off, off: code.on } : code
            },
        }
        return { names, context }
    },
    isTogether: el => !!levelElements.types[el.type]?.codeAll && !el.link && !el.orLink, //written with the others of its type, like mob spots in one list, a linked one spawns on its own
    exportElement(el, name, context) { //one element's generated lines, including its control links
        const type = levelElements.types[el.type]
        const lines = levelData.typeCode(el, name, context)
        const link = type.isLinkable && !type.handlesLink && context.link(el)
        const gate = list => link && list.length ? [`if (${link.on}) {`, ...list.map(line => "    " + line), "}"] : list
        const delay = el.delay > 0 && (el.link || el.orLink) ? [`const ${name}Delay = level.delay(${levelElements.args(el.delay)}); //follows its link ${levelElements.args(el.delay)} cycles late`] : []
        return { setup: [...delay, ...(lines.setup || [])], custom: gate(lines.custom || []), top: gate(lines.top || []) }
    },
    elementCode(data, el) { //the lines one element writes in export JS, for the inspector's js view
        const type = levelElements.types[el.type]
        if (!type) return "//unknown type"
        if (type.isCode) return el.code
        const { names, context } = levelData.codeNames(data)
        const lines = levelData.isTogether(el) ? { setup: type.codeAll(data.elements.filter(other => other.type === el.type && levelData.isTogether(other)), data), custom: [], top: [] } : levelData.exportElement(el, names.get(el.id), context)
        return levelData.sectionsText(lines)
    },
    code(data) {
        const groups = {}
        const custom = []
        const top = []
        const together = new Map() //types with codeAll(elements) write all their elements at once, like mob spots in one list
        const { names, context } = levelData.codeNames(data)
        if (levelData.hasCode(data)) return levelData.codeInOrder(data, names, context)
        for (const el of data.elements) {
            const type = levelElements.types[el.type]
            if (type && levelData.isTogether(el)) {
                if (!together.has(type)) together.set(type, [])
                together.get(type).push(el)
                continue
            }
            if (!type || !type.code) continue
            const lines = levelData.exportElement(el, names.get(el.id), context)
            if (!groups[type.group]) groups[type.group] = []
            groups[type.group].push(...(lines.setup || []))
            custom.push(...lines.custom)
            top.push(...lines.top)
        }
        for (const [type, elements] of together) {
            if (!groups[type.group]) groups[type.group] = []
            groups[type.group].unshift(...type.codeAll(elements, data))
        }
        const indent = lines => lines.map(line => "    " + line)
        const fallHeight = levelData.fallHeight(data)
        const name = levelData.functionName(data.name)
        return [
            `${name}() { //made in the level editor, paste it into level.maps in js/level.js and add "${name}" to level.playableLevels`,
            ...indent([
                ...(groups.core || []),
                ...levelData.exportAnnouncements(data),
                `level.announceText(${levelElements.args(levelData.constraintText(data).x, levelData.constraintText(data).y)}, true) //the run's constraint`,
                "level.announceMobTypes()",
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
                ...(groups.constraint || []),
                ...(groups.mob || []),
                ...(groups.powerUp || []),
                ...(levelData.addsResearch(data) ? ["powerUps.addResearchToLevel() //needs to run after mobs are spawned"] : []),
                ...levelData.exportLevelCode(data),
                `${levelData.dataMark}${JSON.stringify(data).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029")}`, //import level reads this back
            ]),
            "},",
        ].join("\n").replace(/^\s+$/gm, "")
    },

    exportAnnouncements(data) {
        return [
            ...(data.author.trim() ? [`simulation.inGameConsole(\`${levelData.authorLog(data).replace(/[`\\]|\$\{/g, c => "\\" + c)}\`);`] : []),
            ...(data.log.trim() ? [`simulation.inGameConsole(${levelElements.args(levelData.safeHtml(data.log))});`] : []),
        ]
    },
    exportLevelCode(data) { //its setup and two layers share a private scope, just like runLevelCode
        if (!data.levelCode.trim()) return []
        const { setup, custom, top } = levelData.sectionsOf(data.levelCode)
        const lines = ["", "//level code", ";(() => {", ...setup.map(line => "    " + line)]
        for (const [layer, body] of [["custom", custom], ["customTopLayer", top]]) {
            if (!body.length) continue
            lines.push(`    level.${layer} = ((before, after) => () => { before(); after(); })(level.${layer}, () => {`, ...body.map(line => "        " + line), "    });")
        }
        return lines.concat("})();")
    },
    codeInOrder(data, names, context) { //a level with code, everything in its list order like runCode(), the elements' custom and top run after the code's
        const lines = []
        const custom = []
        const top = []
        const together = new Set()
        const draws = levelData.codeDraws(data)
        for (const el of data.elements) {
            const type = levelElements.types[el.type]
            if (!type) continue
            if (type.isCode) {
                lines.push(...el.code.split("\n"))
                continue
            }
            if (levelData.isTogether(el)) { //all of them where the first one is
                if (!together.has(type)) lines.push(...type.codeAll(data.elements.filter(other => other.type === el.type && levelData.isTogether(other)), data))
                together.add(type)
                continue
            }
            if (!type.code) continue
            const out = levelData.exportElement(el, names.get(el.id), context)
            lines.push(...(out.setup || []))
            if (draws[el.type]) continue //the level's code draws it
            custom.push(...out.custom)
            top.push(...out.top)
        }
        const has = text => levelData.codeHas(data, text)
        const text = levelData.constraintText(data)
        const indent = list => list.map(line => "    " + line)
        const name = levelData.functionName(data.name)
        return [
            `${name}() { //made in the level editor, paste it into level.maps in js/level.js and add "${name}" to level.playableLevels`,
            ...indent([
                ...levelData.exportAnnouncements(data),
                ...lines,
                "",
                "//level properties from the level editor", //after the code, so changing them in the editor wins
                `level.defaultZoom = ${data.zoom}`,
                "simulation.zoomTransition(level.defaultZoom)",
                `document.body.style.backgroundColor = ${JSON.stringify(data.background)};`,
                `color.map = ${JSON.stringify(data.mapColor)};`,
                `color.block = ${JSON.stringify(data.blockColor)};`,
                ...(data.gravity !== 1 ? [`simulation.g = simulation.gDefault * ${levelElements.args(data.gravity)}`] : []),
                ...(data.fall === "sky" ? [`level.fallMode = "start";`] : []),
                `simulation.fallHeight = ${levelData.fallHeight(data)}`,
                ...(has("announceText") ? [] : [`level.announceText(${levelElements.args(text.x, text.y)}, true)`, "level.announceMobTypes()"]),
                ...(levelData.addsResearch(data) ? ["powerUps.addResearchToLevel() //needs to run after mobs are spawned"] : []),
                ...(custom.length || top.length ? [
                    "const customFromCode = level.custom",
                    "const customTopLayerFromCode = level.customTopLayer",
                    "level.custom = () => {",
                    ...indent(["customFromCode();", ...custom]),
                    "};",
                    "level.customTopLayer = () => {",
                    ...indent(["customTopLayerFromCode();", ...top]),
                    "};",
                ] : []),
                ...levelData.exportLevelCode(data),
                `${levelData.dataMark}${JSON.stringify(data).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029")}`, //import level reads this back
            ]),
            "},",
        ].join("\n").replace(/^\s+$/gm, "")
    },
    dataMark: "//level editor: ",
    dataOf(text) { //the data on export's level editor line, or null without one, nothing runs
        const line = String(text).split("\n").find(row => row.trim().startsWith(levelData.dataMark.trim()))
        return line ? levelData.normalize(JSON.parse(line.trim().slice(levelData.dataMark.trim().length))) : null
    },
    fromText(text) { //{ data, isCaptured } from export JS, its level editor line if it has one, or the map and blocks its code makes, which runs it, the editor asks first
        const data = levelData.dataOf(text)
        if (data) return { data, isCaptured: false }
        const source = String(text).trim().replace(/,\s*$/, "")
        let maps
        try {
            maps = levelData.codeFunction([], `return { ${source} }`)() //a level.maps function, name() { ... }
        } catch (error) {
            maps = levelData.codeFunction([], `return { imported() { ${source} } }`)() //or just what goes inside one
        }
        const fn = Object.values(maps).find(value => typeof value === "function")
        if (!fn) throw new Error("no level function")
        const name = "levelEditorImport"
        level.maps[name] = fn
        try {
            return { data: levelData.capture(name), isCaptured: true }
        } finally {
            delete level.maps[name]
        }
    },
    sourceData(text) { //a written level's code as data without running any of it, its code stays code elements, the zoom and colors are the defaults, see fromSource()
        const source = String(text).trim().replace(/,\s*$/, "")
        let isFunction = true
        try {
            Function(`return { ${source} }`) //only reads it, a level.maps function, name() { ... }
        } catch (error) {
            isFunction = false //or just what goes inside one
        }
        const whole = isFunction ? source : `imported() {\n${source}\n}`
        return levelData.normalize({ name: "imported", author: levelData.authorOf(whole), elements: levelData.fromSource(whole) })
    },

    //*********************************************************************
    // capture, a written level's code as data, its own code stays as code elements so everything it does still works
    // top level calls with plain numbers, like spawn.mapRect(0, -100, 500, 25) or spawn.randomLevelBoss(3000, -1400), become elements
    // everything else, its variables, special blocks, level.custom, and the flipped version, stays as code in the same order
    //*********************************************************************
    capture(name, source = levelData.sourceOf(name)) { //call while a level is running, then restart the level with simulation.clearNow, which clears out what the written level made
        levelData.clearWorld()
        const ephemera = simulation.ephemera.slice()
        const isHorizontalFlipped = simulation.isHorizontalFlipped
        try {
            simulation.isHorizontalFlipped = false
            level.load(name) //for the zoom and colors it sets
            return levelData.normalize({
                name: levelData.freeName(name + "-copy"),
                zoom: level.defaultZoom,
                background: document.body.style.backgroundColor || "#ddd",
                mapColor: color.map,
                blockColor: color.block,
                author: levelData.authorOf(source),
                elements: levelData.fromSource(source),
            })
        } finally {
            simulation.isHorizontalFlipped = isHorizontalFlipped
            simulation.ephemera = ephemera //effects the level started, like mirrors and zooming
            level.custom = () => { }
            level.customTopLayer = () => { }
            simulation.draw.body = simulation.draw.bodyDefault //community levels can draw blocks their own way
            simulation.clearTimeouts() //anything the level planned to do later
            input.isPauseKeyReady = true //in case its timeout was cleared
        }
    },
    sourceOf(name) {
        const maps = [level.maps, level.localMaps, moreLevels].find(maps => typeof maps[name] === "function")
        if (!maps) throw new Error(`unknown level: ${name}`)
        return maps[name].toString()
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
    scanLines(text) { //each line with the bracket depth it starts and ends at, and where its comment starts, strings and comments don't count
        const lines = []
        let depth = 0
        let mode = "code" //code, line, block, ', ", `
        const templates = [] //depth each ${ in a template started at
        let start = 0
        let startDepth = 0
        let isInside = false //starts inside a string or comment
        let comment = -1
        const end = i => {
            lines.push({ text: text.slice(start, i), depth: startDepth, endDepth: depth, isInside, comment: comment === -1 ? -1 : comment - start })
            start = i + 1
            startDepth = depth
            comment = -1
            if (mode === "line") mode = "code"
            isInside = mode !== "code"
        }
        for (let i = 0; i < text.length; i++) {
            const c = text[i]
            const next = text[i + 1]
            if (c === "\n") {
                end(i)
            } else if (mode === "line") {
                continue
            } else if (mode === "block") {
                if (c === "*" && next === "/") {
                    mode = "code"
                    i++
                }
            } else if (mode === "'" || mode === '"') {
                if (c === "\\") i++
                else if (c === mode) mode = "code"
            } else if (mode === "`") {
                if (c === "\\") {
                    i++
                } else if (c === "`") {
                    mode = "code"
                } else if (c === "$" && next === "{") {
                    templates.push(depth++)
                    mode = "code"
                    i++
                }
            } else if (c === "/" && next === "/") {
                if (comment === -1) comment = i
                mode = "line"
                i++
            } else if (c === "/" && next === "*") {
                mode = "block"
                i++
            } else if (c === "'" || c === '"' || c === "`") {
                mode = c
            } else if ("([{".includes(c)) {
                depth++
            } else if (")]}".includes(c)) {
                depth--
                if (c === "}" && templates.length && templates[templates.length - 1] === depth) {
                    templates.pop()
                    mode = "`"
                }
            }
        }
        end(text.length)
        return lines
    },
    callArgs(text) { //the arguments of a call written with plain numbers and strings, or null
        const args = []
        let current = ""
        let quote = ""
        for (const c of text) {
            if (quote) {
                current += c
                if (c === quote) quote = ""
            } else if (c === '"' || c === "'") {
                current += c
                quote = c
            } else if (c === ",") {
                args.push(current.trim())
                current = ""
            } else {
                current += c
            }
        }
        if (current.trim()) args.push(current.trim())
        return args.map(arg => {
            if (/^-?[\d.\s+\-*/()e]+$/.test(arg) && /\d/.test(arg)) { //numbers, maybe a little math like -1500 + 25
                try {
                    const value = Function(`"use strict"; return (${arg})`)()
                    return Number.isFinite(value) ? value : undefined
                } catch (error) { //split in the middle of something, like (a, b)
                    return undefined
                }
            }
            if (/^"[^"\\]*"$|^'[^'\\]*'$/.test(arg)) return arg.slice(1, -1)
            if (arg === "true" || arg === "false") return arg === "true"
            return undefined
        })
    },
    sourceCalls: { //top level calls that become elements, (args) => [type, props] or null when the arguments don't fit
        "spawn.mapRect": ([x, y, width, height], n) => n === 4 ? ["map", { x, y, width, height }] : null,
        "spawn.mapVertex": ([x, y, path], n) => n === 3 && typeof path === "string" ? ["map", { x, y, path }] : null,
        "spawn.bodyRect": ([x, y, width, height, chance = 1], n) => n === 4 || n === 5 ? ["block", { x, y, width, height, chance }] : null,
        "level.setPosToSpawn": ([x, y], n) => n === 2 ? ["spawn", { x, y, bump: false }] : null,
        "spawn.randomLevelBoss": ([x, y], n) => n === 2 ? ["boss", { x, y }] : null,
        "spawn.secondaryBossChance": ([x, y], n) => n === 2 ? ["secondaryBoss", { x, y }] : null,
        "spawn.randomMob": ([x, y, chance = 1], n) => n === 2 || n === 3 ? ["mob", { x, y, chance }] : null,
        "spawn.randomSmallMob": ([x, y], n) => n === 2 ? ["smallMobs", { x, y }] : null,
        "spawn.randomGroup": ([x, y, chance = 1], n) => n === 2 || n === 3 ? ["mobGroup", { x, y, chance }] : null,
        "spawn.debris": ([x, y, width, count = 6], n) => n === 3 || n === 4 ? ["debris", { x, y, width, count }] : null,
        "powerUps.spawnStartingPowerUps": ([x, y], n) => n === 2 ? ["startingPowerUps", { x, y }] : null,
        "powerUps.chooseRandomPowerUp": ([x, y], n) => n === 2 ? ["randomPowerUp", { x, y }] : null,
        "powerUps.spawn": ([x, y, name], n) => n === 3 && levelElements.types.powerUp.names.includes(name) ? ["powerUp", { x, y, name }] : null,
    },
    fromSource(source) { //elements and code elements, in the order the level's code has them
        const body = source.slice(source.indexOf("{") + 1, source.lastIndexOf("}"))
        const lines = levelData.scanLines(body)
        const code = index => { //the line without its comment
            const line = lines[index]
            return (line.comment === -1 ? line.text : line.text.slice(0, line.comment)).trim()
        }
        const isTop = index => lines[index].depth === 0 && lines[index].endDepth === 0 && !lines[index].isInside
        const near = (index, step) => { //the closest line with code
            for (let i = index + step; i >= 0 && i < lines.length; i += step) if (code(i)) return i
            return -1
        }
        const isAlone = index => { //a statement of its own, not part of the lines around it
            const before = near(index, -1)
            const after = near(index, 1)
            if (before !== -1 && (/(^|\W)(if|else|for|while)\b[^{]*$/.test(code(before)) || /[=+\-*/,(?:&|[]$|=>$/.test(code(before)))) return false
            if (after !== -1 && /^(\.|\?\.)/.test(code(after))) return false
            return true
        }
        const elements = []
        const used = new Set() //lines that became elements
        const element = (index, type, props) => {
            const el = levelElements.create(type, props)
            el.line = index //where it goes, removed below
            elements.push(el)
            used.add(index)
            return el
        }
        let spawnEl = null
        let exitEl = null
        const exitLines = []
        for (let i = 0; i < lines.length; i++) {
            if (!isTop(i) || !isAlone(i)) continue
            const text = code(i).replace(/;$/, "")
            const exit = text.match(/^level\.exit\.(x|y)\s*=\s*(-?[\d.]+)$/)
            if (exit) {
                if (!exitEl) exitEl = element(i, "exit", { x: undefined, y: undefined, bump: false })
                exitEl[exit[1]] = Number(exit[2])
                exitLines.push(i)
                used.add(i)
                continue
            }
            const compact = text.replace(/\s+/g, "")
            if (compact === "spawn.mapRect(level.exit.x,level.exit.y+20,100,20)" && exitEl) { //the bumps the doors stand on
                exitEl.bump = true
                used.add(i)
                continue
            }
            if (compact === "spawn.mapRect(level.enter.x,level.enter.y+20,100,20)" && spawnEl) {
                spawnEl.bump = true
                used.add(i)
                continue
            }
            if (/^spawn\.randomMobPositions\s*=\s*\[$/.test(text)) continue //handled below, it's more than one line
            if (levelData.authorLine.test(text)) { //the author log, capture() makes it the level's author
                used.add(i)
                continue
            }
            const namedMob = text.match(/^spawn\["(\w+)"\]\((.*)\)$/)
            const call = text.match(/^([\w.]+)\((.*)\)$/) || (namedMob && [text, "spawn." + namedMob[1], namedMob[2]])
            if (!call) continue
            const args = levelData.callArgs(call[2])
            if (args.includes(undefined)) continue
            const make = levelData.sourceCalls[call[1]] || (call[1].startsWith("spawn.") && levelElements.mobNames().includes(call[1].slice(6)) ? ([x, y], n) => n === 2 ? ["namedMob", { x, y, name: call[1].slice(6) }] : null : null)
            const found = make && make(args, args.length)
            if (!found) continue
            const [type, props] = found
            if (type === "spawn" && spawnEl) continue //only the first, written levels sometimes set it again
            const el = element(i, type, props)
            if (type === "spawn") spawnEl = el
            if (props.path !== undefined) { //spawn.mapVertex puts the center of its vertices at x, y like the editor does
                const numbers = props.path.trim().split(/[\s,]+/).map(Number)
                const points = []
                for (let j = 0; j + 1 < numbers.length; j += 2) points.push({ x: numbers[j], y: numbers[j + 1] })
                const c = levelElements.centroid(points)
                delete el.path
                levelElements.setPoints(el, points.map(p => ({ x: p.x - c.x + props.x, y: p.y - c.y + props.y })))
            }
        }
        if (exitEl && (exitEl.x === undefined || exitEl.y === undefined)) { //only one of exit.x and exit.y at the top, the level's code keeps setting it
            elements.splice(elements.indexOf(exitEl), 1)
            for (const i of exitLines) used.delete(i)
        }
        for (let i = 0; i < lines.length; i++) { //mob spots written like the newer levels, and the spawn.randomMobFromArray() after them
            if (lines[i].depth !== 0 || lines[i].isInside || used.has(i) || !/^spawn\.randomMobPositions\s*=\s*\[$/.test(code(i))) continue
            let last = i + 1
            while (last < lines.length && lines[last].endDepth !== 0) last++
            const text = lines.slice(i, last + 1).map((line, j) => code(i + j)).join(" ")
            const match = text.match(/^spawn\.randomMobPositions\s*=\s*\[(.*)\]\s*\.map\(\(\[x,\s*y,\s*isSmall\s*=\s*false\]\)\s*=>\s*\(\{\s*x,\s*y,\s*isSmall\s*\}\)\);?$/)
            const call = lines.findIndex((line, j) => j > last && isTop(j) && code(j).replace(/;$/, "") === "spawn.randomMobFromArray()")
            if (!match || call === -1) continue
            const rows = [...match[1].matchAll(/\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*(?:,\s*(true|false)\s*)?\]/g)]
            for (const row of rows) element(i, "mobSpot", { x: Number(row[1]), y: Number(row[2]), small: row[3] === "true" })
            for (let j = i; j <= last; j++) used.add(j)
            used.add(call)
            break
        }
        //the rest of the lines are code, lines next to each other are one code element
        const parts = []
        let chunk = null
        for (let i = 0; i < lines.length; i++) {
            if (used.has(i)) {
                chunk = null
                const placed = elements.filter(el => el.line === i)
                for (const el of placed) parts.push(el)
                continue
            }
            if (!chunk) {
                if (!code(i)) continue //blank lines and comments between elements
                chunk = { type: "code", lines: [] }
                parts.push(chunk)
            }
            chunk.lines.push(lines[i].text)
        }
        for (const el of elements) delete el.line
        return parts.map(part => {
            if (part.type !== "code") return part
            while (part.lines.length && !part.lines[part.lines.length - 1].trim()) part.lines.pop()
            const indent = Math.min(...part.lines.filter(line => line.trim()).map(line => line.match(/^\s*/)[0].length))
            return levelElements.create("code", { code: part.lines.map(line => line.slice(indent)).join("\n") })
        }).filter(el => el.type !== "code" || el.code.trim())
    },

})
