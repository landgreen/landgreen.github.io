"use strict";
//level editor, opened with the button next to level pool in settings
//it's a run of the game on a local level, so the player can move, jump, and use testing mode (T) while editing
//  levelElements: what can be placed, levelData: building, capturing, and saving levels
//  hooks into the game: level.start() calls levelEditor.startLevel(), m.death() calls levelEditor.respawn(),
//  simulation.splashReturn() calls levelEditor.close(), mouseMove.wantsLock() is false while it's open
//see docs/level-editor.md
const levelEditor = {
    isActive: false,
    data: null, //the level being edited, the same object as levelData.data
    selection: [], //element ids
    tool: "select",
    tools: ["select", "map", "block", "measure"], //the draw tool, map and block draw new rects, select only selects and moves, measure draws a ruler with jump reach, the right mouse button always selects
    measure: null, //{ start, end } the measure tool's ruler, it stays until the next one
    inspectMode: "props", //the inspector shows an element's props, or "js", the lines it writes in export JS
    timeScale: 1, //simulation menu, slows the game by lowering the frame cap
    isTimeScaled: false,
    debugDraw: new Set(), //simulation menu's draw toggles, like "wireframe" and "velocity"
    readoutCycle: 0,
    grid: 25, //snap size, hold alt to place freely
    isGridShown: true,
    isFree: false, //alt is held
    drag: null, //{ kind: "move" | "handle" | "draw" | "box" | "pan", ... } while the left or middle mouse button is held
    hoverId: null,
    isTesting: false, //start test restarts the level like a run, stop test restarts it for editing
    isFullTest: false, //full test plays the level's export JS like a run, with the panels still open, editing anything goes back to editing
    isTestSpawning: true, //the mobs, power ups checkbox, mobs and power ups spawn while testing, never while editing so it isn't a fight
    testLevel: 5, //level.levelsCleared while editing, for mob types, difficulty, and damage, at 0 random mobs don't spawn
    vertex: null, //{ id, active, error } while editing a map or block's vertices, active is the clicked vertex, error is why typed vertices didn't work
    pathDraw: null, //{ points } while drawing a path, see the drawPath command
    hiddenTypes: new Set(), //the explorer's hide, hidden elements aren't built while editing, tests show them
    hiddenIds: new Set(),
    lockedTypes: new Set(), //the explorer's lock, the mouse goes through locked elements, the explorer still selects them
    lockedIds: new Set(),
    problems: new Map(), //element id: the analysis lines about it, outlined in the level
    isAnalysisShown: false, //the inspector shows the analysis, see inspectAnalysis()
    isAnalysisJump: false,
    analysisReport: null, //the last analysis, kept up to date by countProblems()
    analysisCursor: new Map(), //an analysis line's ids: which one it went to last
    paletteDrag: null, //{ command, arg, x, y, isDragging } dragging an add button onto the level
    isPanelsHidden: false, //tab, and during full test
    isHistoryOpen: false, //the history list over undo and redo in the status bar
    statusMouse: "", //what the status bar shows for the mouse
    problemTimer: null,
    problemText: "",
    problemIsFix: false, //the status bar's analysis count, a moment after changes stop
    codeEditing: null, //id of the code element open in the code panel, "new" for + code, which only adds it when applied
    picking: null, //{ id, key, isLink } while picking an element by clicking it, for a ref prop, or isLink to link it to button id
    preview: null, //{ owner, key, value } while a color picker is open, value is the color to put back before the change is saved
    clipboard: [],
    history: { steps: [], index: 0 }, //{ label, json } of the level after each change, steps[index] is now, later steps were undone
    historyLimit: 200,
    pan: { x: 0, y: 0 }, //camera offset from the player
    zoomScale: 1400, //simulation.zoomScale to use when the level restarts, data.zoom is for runs
    gameCamera: null, //simulation.camera while the editor replaces it
    saveTimer: null,
    inspected: "", //what the inspector is showing, so it only redraws when that changes

    //*********************************************************************
    // opening and closing
    //*********************************************************************
    async open() {
        if (simulation.isStartingGame || levelEditor.isActive) return
        const data = levelData.store.getRecent() || levelData.blank(levelData.freeName("untitled"))
        levelData.store.save(data)
        levelEditor.reset(data)
        levelEditor.isActive = true
        await simulation.startGame() //the first level start calls levelEditor.startLevel() instead of loading initial
        if (simulation.onTitlePage) levelEditor.isActive = false //startGame failed
    },
    reset(data) {
        levelEditor.data = data
        levelEditor.selection = []
        levelEditor.history = { steps: [{ label: `open ${data.name}`, json: JSON.stringify(data) }], index: 0 }
        levelEditor.pan = { x: 0, y: 0 }
        levelEditor.zoomScale = data.zoom
        levelEditor.drag = null
        levelEditor.vertex = null
        levelEditor.pathDraw = null
        levelEditor.preview = null
        levelEditor.picking = null
        levelEditor.hiddenIds.clear() //ids are only the same within a level
        levelEditor.lockedIds.clear()
        levelEditor.problems = new Map()
    },
    startLevel() { //called by level.start() in place of level.load()
        const data = levelEditor.data
        level.levels = [data.name]
        level.onLevel = 0
        simulation.isCheating = true //editing isn't a run, so it doesn't count, store tech, or show the training choice at the exit
        simulation.isAutoZoom = false
        level.levelsCleared = levelEditor.testLevel //saveGame.autosave() skips the editor, so this doesn't make a checkpoint
        level.updateDifficulty()
        spawn.setSpawnList() //new mob types each restart, like a new level
        if (!levelEditor.gameCamera) levelEditor.gameCamera = simulation.camera
        if (levelEditor.isFullTest) {
            levelEditor.startFullTest(data)
        } else {
            levelData.isSkipped = el => !levelEditor.isTesting && levelEditor.isHidden(el) //the explorer's hide, tests show everything
            levelData.play(data, { isEditor: true, isSpawning: levelEditor.isTesting && levelEditor.isTestSpawning })
            simulation.setZoom(levelEditor.zoomScale)
            simulation.camera = levelEditor.camera
            m.look = levelEditor.look
        }
        level.disableExit = true //the exit charges, but doesn't leave
        simulation.removeEphemera("levelEditor", true)
        simulation.ephemera.push({ name: "levelEditor", do() { levelEditor.frame() } })
        document.body.classList.add("level-editor")
        levelEditor.updatePanels()
        levelEditor.renderLeft()
        levelEditor.renderRight()
    },
    close() { //also called by simulation.splashReturn()
        if (!levelEditor.isActive) return
        levelEditor.flush()
        levelEditor.isActive = false
        levelEditor.isFullTest = false
        levelEditor.isPanelsHidden = false
        levelEditor.updatePanels()
        levelEditor.drag = null
        levelData.isEditor = false
        levelData.isSkipped = () => false
        document.body.classList.remove("level-editor")
        document.getElementById("level-editor-code").classList.remove("le-open")
        if (levelEditor.gameCamera) simulation.camera = levelEditor.gameCamera
        levelEditor.gameCamera = null
        m.look = m.lookDefault
        simulation.removeEphemera("levelEditor", true)
    },
    exit() { //back to the title page, like the end of a run
        levelEditor.close()
        m.alive = false
        simulation.paused = true
        simulation.ephemera = []
        for (const id of ["text-log", "health", "health-bg", "defense-bar", "guns", "field", "right-HUD", "right-HUD-constraint"]) document.getElementById(id).style.display = "none"
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        Composite.clear(engine.world)
        Engine.clear(engine)
        simulation.splashReturn()
    },
    restart(isKeepView = true) { //clears and rebuilds the whole level, and puts the player at the spawn
        levelEditor.flush()
        if (isKeepView) levelEditor.zoomScale = simulation.zoomScale
        levelEditor.drag = null
        simulation.clearNow = true
    },
    startFullTest(data) { //runs the export JS like level.load() runs a written level, with the game's camera and zoom
        levelData.unbuildAll()
        levelData.isEditor = false
        simulation.camera = levelEditor.gameCamera
        m.look = m.lookDefault
        try {
            const maps = new Function(`return { ${levelData.code(data).trim().replace(/,\s*$/, "")} }`)()
            levelData.trackEphemera(() => Object.values(maps)[0].call(level))
        } catch (error) {
            console.error(error)
            simulation.inGameConsole(`<em>//full test stopped, the javascript threw ${levelEditor.escape(error.message)}</em>`)
            setTimeout(() => levelEditor.stopFullTest(), 0)
        }
    },
    stopFullTest() { //back to editing, the level restarts from its elements
        if (!levelEditor.isFullTest) return
        levelEditor.isFullTest = false
        levelEditor.isPanelsHidden = false
        levelEditor.updatePanels()
        levelEditor.renderLeft()
        levelEditor.restart()
    },
    respawn() { //called by m.death(), dying while editing sends the player back to the spawn
        m.health = m.maxHealth
        m.displayHealth()
        m.immuneCycle = m.cycle + 60
        levelEditor.toSpawn()
        simulation.inGameConsole(`<em>//respawned</em>`)
    },
    middleClickTimer: null,
    middleClickPoint: null,
    middleClick(point) { //a middle click centers on the player, a middle double click teleports the player, so the first click waits to see if there's a second
        if (levelEditor.middleClickTimer) {
            clearTimeout(levelEditor.middleClickTimer)
            levelEditor.middleClickTimer = null
            if (!levelEditor.isFullTest) levelEditor.teleport(levelEditor.middleClickPoint) //where the first click was, before anything moved
            return
        }
        levelEditor.middleClickPoint = point
        levelEditor.middleClickTimer = setTimeout(() => {
            levelEditor.middleClickTimer = null
            levelEditor.pan = { x: 0, y: 0 }
        }, 300)
    },
    teleport(point) { //middle double click, the player goes there
        Matter.Body.setPosition(player, point)
        Matter.Body.setVelocity(player, { x: 0, y: 0 })
        m.resetHistory()
    },
    toSpawn() {
        const where = levelEditor.data.elements.find(el => el.type === "spawn") || m.spawnPos //a level's code can set the spawn itself
        Matter.Body.setPosition(player, { x: where.x, y: where.y })
        Matter.Body.setVelocity(player, { x: 0, y: 0 })
        m.resetHistory()
    },

    //*********************************************************************
    // changing the level, every change goes through edit() so it can be undone, saved, and rebuilt
    //*********************************************************************
    edit(label, change) { //change(data) changes the data and returns the ids of elements to rebuild, label is its name in the history menu
        const before = JSON.stringify(levelEditor.data)
        const ids = change(levelEditor.data) || []
        return levelEditor.commit(label, before, ids)
    },
    commit(label, before, ids) {
        const json = JSON.stringify(levelEditor.data)
        if (json === before) return false
        const isFullTest = levelEditor.isFullTest
        if (isFullTest) ids = [] //the level is the export JS right now, editing goes back to building it from elements
        const history = levelEditor.history
        history.steps.length = history.index + 1 //a new change replaces anything that was undone
        history.steps.push({ label, json })
        if (history.steps.length > levelEditor.historyLimit) history.steps.shift()
        history.index = history.steps.length - 1
        const isCode = levelEditor.isCodeChange(ids)
        if (!isCode) levelData.rebuild(ids)
        levelEditor.changed()
        if (isFullTest) return levelEditor.stopFullTest() || true
        if (isCode) levelEditor.restart() //code runs once in order with the rest of the level, so the whole level runs again
        return true
    },
    isCodeChange(ids) { //a code element changed, was added, or was removed
        if (ids === "all") return levelData.hasCode(levelEditor.data) //everything rebuilds, a level with code runs again
        return ids.some(id => levelElements.types[levelData.find(levelEditor.data, id)?.type]?.isCode || levelData.runtimes.get(id)?.isCode)
    },
    describe(elements) { //for history labels, one element with where it is, or how many of each type
        if (elements.length === 1) return levelElements.summary(elements[0])
        const counts = {}
        for (const el of elements) counts[el.type] = (counts[el.type] || 0) + 1
        return Object.keys(counts).map(type => `${counts[type]} ${levelElements.nameOf(type)}`).join(", ")
    },
    changed() {
        levelEditor.selection = levelEditor.selection.filter(id => levelData.find(levelEditor.data, id))
        if (levelEditor.vertex && !levelEditor.vertexElement()) levelEditor.vertex = null
        levelEditor.save()
        levelEditor.refreshRight()
        levelEditor.refreshFields()
        levelEditor.updateHistoryButtons()
        levelEditor.renderExplorer()
        levelEditor.updateSelectionStatus()
        levelEditor.countProblems()
    },
    undo() {
        levelEditor.rewind(levelEditor.history.index - 1)
    },
    redo() {
        levelEditor.rewind(levelEditor.history.index + 1)
    },
    rewind(index) { //go to any step in the history, undo and redo are one step
        const history = levelEditor.history
        if (index < 0 || index >= history.steps.length || index === history.index) return
        history.index = index
        const data = JSON.parse(history.steps[index].json)
        data.name = levelEditor.data.name //renaming isn't undone, the name is where the level is saved
        const old = new Map(levelEditor.data.elements.map(el => [el.id, JSON.stringify(el)]))
        const ids = data.elements.filter(el => old.get(el.id) !== JSON.stringify(el)).map(el => el.id) //only rebuild what's different, so blocks that weren't changed stay where they were pushed
        for (const id of old.keys()) if (!levelData.find(data, id)) ids.push(id)
        levelEditor.data = levelData.data = data
        levelEditor.applyLevelProps()
        if (levelEditor.isFullTest) { //the level is the export JS right now
            levelEditor.changed()
            return levelEditor.stopFullTest()
        }
        const isCode = levelEditor.isCodeChange(ids)
        if (!isCode) levelData.rebuild(ids)
        levelEditor.changed()
        if (isCode) levelEditor.restart()
    },
    applyLevelProps() { //level properties show right away
        levelData.applySettings(levelEditor.data)
        levelEditor.refreshFields()
    },
    setData(data) { //switch to another level
        levelEditor.flush()
        levelData.store.save(data)
        levelEditor.reset(data)
        levelEditor.renderLeft()
        levelEditor.restart(false)
    },
    save() { //soon, so dragging and typing don't write to localStorage every change
        clearTimeout(levelEditor.saveTimer)
        levelEditor.saveTimer = setTimeout(levelEditor.flush, 300)
        levelEditor.updateSaved()
    },
    flush() {
        if (levelEditor.saveTimer === null) return
        clearTimeout(levelEditor.saveTimer)
        levelEditor.saveTimer = null
        if (levelEditor.data) levelData.store.save(levelEditor.data)
        levelEditor.updateSaved()
    },

    //*********************************************************************
    // selection
    //*********************************************************************
    select(ids) {
        if (!levelEditor.isAnalysisJump) levelEditor.isAnalysisShown = false //selecting something goes back to its props, clicking an analysis line keeps the analysis
        levelEditor.selection = ids
        if (levelEditor.vertex && !(ids.length === 1 && ids[0] === levelEditor.vertex.id)) levelEditor.vertex = null //selecting something else ends vertex editing
        levelEditor.renderRight()
    },
    selected() {
        return levelEditor.selection.map(id => levelData.find(levelEditor.data, id)).filter(Boolean)
    },
    isSingleton(el) {
        return !!levelElements.types[el.type]?.isSingleton
    },
    isCopyable(el) { //code can't be copied, its variables would be declared twice
        return !levelEditor.isSingleton(el) && !levelElements.types[el.type]?.isCode
    },
    isLocked(el) { //the explorer's lock, the mouse goes through it
        return levelEditor.lockedTypes.has(el.type) || levelEditor.lockedIds.has(el.id)
    },
    isHideable(el) { //not the spawn and exit, the level needs them, or code, code after it could need it
        const type = levelElements.types[el.type]
        return !!type && type.group !== "core" && !type.isCode
    },
    isHidden(el) { //the explorer's hide, not built while editing
        return levelEditor.isHideable(el) && (levelEditor.hiddenTypes.has(el.type) || levelEditor.hiddenIds.has(el.id))
    },
    elementAt(point) { //the smallest element under point, so things on top of big map pieces can be picked
        let best = null
        let bestArea = Infinity
        for (const el of levelEditor.data.elements) {
            if (levelEditor.isLocked(el) || levelEditor.isHidden(el)) continue
            if (!levelElements.contains(el, point) && !levelData.runtimeContains(el.id, point)) continue
            const b = levelElements.bounds(el)
            const area = levelElements.types[el.type]?.pickArea?.(el) ?? b.width * b.height
            if (area <= bestArea) { //ties go to the later element, it's drawn on top
                best = el
                bestArea = area
            }
        }
        return best
    },
    rotateHandle(el) { //a round handle above the element, drag it to turn
        if (!levelElements.isRotatable(el)) return null
        const b = levelElements.bounds(el)
        return { x: b.x + b.width / 2, y: b.y - levelEditor.px(28) }
    },
    dragTurn(drag) { //degrees the rotate handle has turned, in 15° steps unless alt is held
        const point = levelEditor.mouse()
        const angle = (Math.atan2(point.y - drag.pivot.y, point.x - drag.pivot.x) - Math.atan2(drag.from.y - drag.pivot.y, drag.from.x - drag.pivot.x)) * 180 / Math.PI
        const turn = ((angle % 360) + 540) % 360 - 180
        return levelEditor.isFree ? Number(turn.toFixed(1)) : Math.round(turn / 15) * 15
    },
    handleAt(el, point) {
        const reach = levelEditor.px(7)
        return levelElements.handles(el).find(h => Math.abs(h.x - point.x) < reach && Math.abs(h.y - point.y) < reach)
    },

    //*********************************************************************
    // coordinates
    //*********************************************************************
    px(pixels) { //screen pixels to map units
        return pixels / simulation.zoom
    },
    mouse() { //map position under the mouse right now, simulation.mouseInGame is from the start of the cycle
        return {
            x: (simulation.mouse.x - canvas.width2) / simulation.zoom + canvas.width2 - m.transX,
            y: (simulation.mouse.y - canvas.height2) / simulation.zoom + canvas.height2 - m.transY,
        }
    },
    snap(value) {
        const size = levelEditor.isFree ? 1 : levelEditor.grid
        return Math.round(value / size) * size
    },
    snapPoint(point) {
        return { x: levelEditor.snap(point.x), y: levelEditor.snap(point.y) }
    },
    viewCenter() {
        return { x: m.pos.x + levelEditor.pan.x, y: m.pos.y + levelEditor.pan.y }
    },
    look() { //replaces m.look, the camera follows the player without leaning toward the mouse, so moving to a panel doesn't move the view
        m.angle = Math.atan2(simulation.mouseInGame.y - m.pos.y, simulation.mouseInGame.x - m.pos.x)
        m.transX = m.transSmoothX = canvas.width2 - m.pos.x - levelEditor.pan.x
        m.transY = m.transSmoothY = canvas.height2 - m.pos.y - levelEditor.pan.y
    },
    camera() { //replaces simulation.camera, without zooming out when the mouse is near the edge
        simulation.edgeZoomOutSmooth = 1
        ctx.save()
        ctx.translate(canvas.width2, canvas.height2)
        ctx.scale(simulation.zoom, simulation.zoom)
        ctx.translate(-canvas.width2 + m.transX, -canvas.height2 + m.transY)
        simulation.mouseInGame.x = (simulation.mouse.x - canvas.width2) / simulation.zoom + canvas.width2 - m.transX
        simulation.mouseInGame.y = (simulation.mouse.y - canvas.height2) / simulation.zoom + canvas.height2 - m.transY
    },
    zoom(scale) { //keeps the spot under the mouse still
        const before = levelEditor.mouse()
        levelEditor.zoomScale = Math.min(30000, Math.max(200, scale))
        simulation.setZoom(levelEditor.zoomScale)
        levelEditor.pan.x = before.x - m.pos.x - (simulation.mouse.x - canvas.width2) / simulation.zoom
        levelEditor.pan.y = before.y - m.pos.y - (simulation.mouse.y - canvas.height2) / simulation.zoom
        levelEditor.look()
        levelEditor.updateZoomField()
    },
    zoomTo(scale) { //keeps the middle of the view still, for the zoom field
        levelEditor.zoomScale = Math.min(30000, Math.max(200, scale))
        simulation.setZoom(levelEditor.zoomScale)
        levelEditor.look()
        levelEditor.updateZoomField()
    },
    updateZoomField() {
        const field = document.querySelector('#level-editor-status [data-setting="zoom"]')
        if (field && field !== document.activeElement) field.value = Math.round(levelEditor.zoomScale)
    },

    //*********************************************************************
    // mouse, left button uses the draw tool, right button always selects and moves, middle button pans
    // the field is still on its key (space), so the right button isn't needed for it
    //*********************************************************************
    mouseDown(event) {
        if (!levelEditor.isActive || simulation.paused || levelEditor.isFullTest) return //full test plays like a run, the mouse fires
        if (event.button === 1) {
            event.preventDefault()
            levelEditor.drag = { kind: "pan", button: 1, moved: 0, point: levelEditor.mouse() }
            return
        }
        if (event.button !== 0 && event.button !== 2) return
        event.stopPropagation() //don't fire or use the field
        if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur() //finishes typing in the inspector
        const point = levelEditor.mouse()
        if (levelEditor.pathDraw) return levelEditor.pathClick(point, event.button)
        if (levelEditor.picking) return levelEditor.pick(levelEditor.elementAt(point))
        const drag = { button: event.button, start: point, screen: { x: simulation.mouse.x, y: simulation.mouse.y }, before: JSON.stringify(levelEditor.data) }
        const vertexHit = levelEditor.vertexAt(point)
        if (vertexHit) { //either button drags a vertex, or a dot in the middle of an edge to add one there
            const el = levelEditor.vertexElement()
            const points = levelElements.points(el)
            if (vertexHit.isNew) points.splice(vertexHit.index, 0, vertexHit.point)
            levelEditor.vertex.active = vertexHit.isNew ? -1 : vertexHit.index
            levelEditor.drag = { ...drag, kind: "vertex", id: el.id, index: vertexHit.index, isNew: vertexHit.isNew, points }
            return
        }
        const selected = levelEditor.selected()
        const turnHandle = !levelEditor.vertex && selected.length === 1 && levelEditor.rotateHandle(selected[0])
        if (turnHandle && Math.hypot(point.x - turnHandle.x, point.y - turnHandle.y) < levelEditor.px(8)) { //the round handle above a rotatable element
            levelEditor.drag = { ...drag, kind: "handle", id: selected[0].id, handle: "rotate", original: levelData.copy(selected[0]), pivot: levelElements.pivot(selected[0]), from: turnHandle }
            return
        }
        const handle = !levelEditor.vertex && selected.length === 1 && levelEditor.handleAt(selected[0], point)
        if (handle) {
            levelEditor.drag = { ...drag, kind: "handle", id: selected[0].id, handle: handle.id, original: levelData.copy(selected[0]) }
            return
        }
        const hit = levelEditor.elementAt(point)
        const isOnSelection = hit && levelEditor.selection.includes(hit.id)
        const grab = hit && (levelEditor.tool === "select" || event.button === 2 || isOnSelection) && levelElements.types[hit.type]?.grabHandle?.(hit, point)
        if (grab) { //part of an element that drags on its own, like a boss's other spot
            if (!isOnSelection || levelEditor.selection.length > 1) levelEditor.select([hit.id])
            levelEditor.drag = { ...drag, kind: "handle", id: hit.id, handle: grab, original: levelData.copy(hit) }
            return
        }
        const tool = event.button === 2 ? "select" : levelEditor.tool
        const isAdding = event.shiftKey || event.metaKey || event.ctrlKey //shift, ⌘, or ctrl click adds to the selection or takes away
        if (tool === "measure") { //a ruler from here to where it's let go, with how far the player can jump from here
            const start = levelEditor.snapPoint(point)
            levelEditor.measure = { start, end: start }
            levelEditor.drag = { ...drag, kind: "measure" }
            return
        }
        if (tool !== "select" && !isOnSelection) { //drawing, a click without dragging selects instead
            levelEditor.drag = { ...drag, kind: "draw", hitId: hit ? hit.id : null }
        } else if (hit) {
            if (isAdding) {
                levelEditor.select(isOnSelection ? levelEditor.selection.filter(id => id !== hit.id) : levelEditor.selection.concat(hit.id))
                if (isOnSelection) return
            } else if (!isOnSelection) {
                levelEditor.select([hit.id])
            }
            levelEditor.drag = { ...drag, kind: "move", originals: levelEditor.selected().map(el => levelData.copy(el)) }
        } else {
            if (!isAdding) levelEditor.select([])
            levelEditor.drag = { ...drag, kind: "box", isAdding }
        }
    },
    mouseMove(event) {
        levelEditor.isFree = event.altKey
        const drag = levelEditor.drag
        if (drag && drag.kind === "pan") {
            levelEditor.pan.x -= event.movementX / simulation.zoom
            levelEditor.pan.y -= event.movementY / simulation.zoom
            drag.moved += Math.abs(event.movementX) + Math.abs(event.movementY)
        }
    },
    mouseUp(event) {
        const drag = levelEditor.drag
        if (!drag || event.button !== drag.button) return
        levelEditor.drag = null
        if (drag.kind === "pan") {
            if (drag.moved < 4) levelEditor.middleClick(drag.point)
            return
        }
        if (drag.kind === "measure") return //the ruler stays until the next one or esc
        const isClick = Math.hypot(simulation.mouse.x - drag.screen.x, simulation.mouse.y - drag.screen.y) < 4
        if (drag.kind === "vertex") {
            if (isClick) return //a click picks the vertex for delete, an edge dot adds a vertex only when dragged
            const { points, error } = levelEditor.vertexPreview(drag)
            if (error) {
                simulation.inGameConsole(`<em>//shape ${error}</em>`)
                return
            }
            const el = levelData.find(levelEditor.data, drag.id)
            levelEditor.edit(`${drag.isNew ? "add" : "move"} vertex ${drag.index} ${levelEditor.describe([el])}`, () => {
                levelElements.setPoints(el, points)
                return [el.id]
            })
            levelEditor.vertex.active = drag.index
            return
        }
        if (drag.kind === "draw") {
            if (isClick) {
                levelEditor.select(drag.hitId ? [drag.hitId] : [])
                return
            }
            const el = levelElements.create(levelEditor.tool, levelEditor.dragRect(drag))
            levelEditor.edit(`draw ${levelEditor.describe([el])}`, data => [levelData.add(data, el).id]) //draw map(x, y, width, height), like spawn.mapRect
            levelEditor.select([el.id])
            return
        }
        if (isClick) {
            if (drag.kind === "box" && !drag.isAdding) levelEditor.select([])
            return
        }
        if (drag.kind === "box") {
            const box = levelEditor.dragRect(drag, false)
            const inside = levelEditor.data.elements.filter(el => !levelEditor.isLocked(el) && !levelEditor.isHidden(el) && !levelElements.types[el.type]?.isCode).filter(el => {
                const b = levelElements.bounds(el)
                return b.x >= box.x && b.y >= box.y && b.x + b.width <= box.x + box.width && b.y + b.height <= box.y + box.height
            }).map(el => el.id)
            levelEditor.select(drag.isAdding ? [...new Set(levelEditor.selection.concat(inside))] : inside)
        } else { //move or handle, the data didn't change during the drag, only the preview did
            const changed = levelEditor.dragPreview(drag)
            for (const el of changed) Object.assign(levelData.find(levelEditor.data, el.id), el)
            const f = levelEditor.formatValue
            const by = changed.length > 1 ? ` by ${f(changed[0].x - drag.originals[0].x)}, ${f(changed[0].y - drag.originals[0].y)}` : "" //one element shows where it ended up, more show how far they moved
            const verb = drag.kind === "move" ? "move" : drag.handle === "rotate" ? "rotate" : drag.handle.startsWith("spot") ? `move spot ${Number(drag.handle.slice(4)) + 2} of` : "resize" //a boss's other spots are handles too
            const turn = drag.handle === "rotate" ? ` ${levelEditor.dragTurn(drag)}°` : ""
            levelEditor.commit(`${verb} ${levelEditor.describe(changed)}${by}${turn}`, drag.before, changed.map(el => el.id))
        }
    },
    wheel(event) {
        if (!levelEditor.isActive || simulation.paused || levelEditor.isFullTest) return
        event.preventDefault()
        levelEditor.zoom(simulation.zoomScale * (event.deltaY > 0 ? 1.1 : 1 / 1.1))
    },
    dragRect(drag, isSnapped = true) { //rect between where the drag started and the mouse
        const a = isSnapped ? levelEditor.snapPoint(drag.start) : drag.start
        const b = isSnapped ? levelEditor.snapPoint(levelEditor.mouse()) : levelEditor.mouse()
        const min = isSnapped && !levelEditor.isFree ? levelEditor.grid : 1
        const x = Math.min(a.x, b.x)
        const y = Math.min(a.y, b.y)
        return { x, y, width: Math.max(min, Math.abs(b.x - a.x)), height: Math.max(min, Math.abs(b.y - a.y)) }
    },
    dragPreview(drag) { //copies of the dragged elements where they'd end up
        const point = levelEditor.mouse()
        if (drag.kind === "handle" && drag.handle === "rotate") {
            const el = levelData.copy(drag.original)
            levelElements.rotate(el, levelEditor.dragTurn(drag), drag.pivot)
            return [el]
        }
        if (drag.kind === "handle") {
            const el = levelData.copy(drag.original)
            levelElements.dragHandle(el, drag.handle, levelEditor.snapPoint(point), levelEditor.isFree ? 1 : levelEditor.grid)
            return [el]
        }
        const dx = levelEditor.snap(point.x - drag.start.x)
        const dy = levelEditor.snap(point.y - drag.start.y)
        return drag.originals.map(original => {
            const el = levelData.copy(original)
            levelElements.move(el, dx, dy, drag.originals.length > 1) //moving one portal end leaves the other, moving several moves them whole
            return el
        })
    },

    vertexPreview(drag) { //the shape's world points with the dragged vertex at the mouse, and why it can't be made
        const points = drag.points.map(p => ({ x: p.x, y: p.y }))
        points[drag.index] = levelEditor.snapPoint(levelEditor.mouse())
        return { points, error: levelElements.checkPoints(points, levelData.find(levelEditor.data, drag.id)) }
    },

    //*********************************************************************
    // picking, click an element for a ref prop like a constraint's block, or to link it to a button
    //*********************************************************************
    canPick(el) {
        const picking = levelEditor.picking
        const owner = picking && levelData.find(levelEditor.data, picking.id)
        if (!el || !owner) return false
        return picking.isLink ? levelElements.isRefTo(el, "link", owner) : levelElements.isRefTo(owner, picking.key, el)
    },
    pick(el) {
        const picking = levelEditor.picking
        const isPickable = levelEditor.canPick(el)
        levelEditor.picking = null
        const owner = levelData.find(levelEditor.data, picking.id)
        if (isPickable) {
            if (picking.isLink) {
                levelEditor.edit(`link ${levelEditor.describe([el])} to ${levelEditor.describe([owner])}`, () => {
                    el.link = owner.id
                    return [el.id]
                })
            } else {
                levelEditor.edit(`${levelEditor.describe([owner])}.${picking.key} = ${el.id}`, () => {
                    owner[picking.key] = el.id
                    return [owner.id]
                })
            }
        }
        levelEditor.renderRight()
    },

    //*********************************************************************
    // drawing a path, the add menu's path button, a point each click
    //*********************************************************************
    pathClick(point, button) {
        const points = levelEditor.pathDraw.points
        if (button === 2) return levelEditor.finishPath(false)
        const snapped = levelEditor.snapPoint(point)
        const reach = levelEditor.px(10)
        const isNear = p => p && Math.hypot(p.x - point.x, p.y - point.y) < reach
        if (points.length > 2 && isNear(points[0])) return levelEditor.finishPath(true)
        if (points.length > 1 && isNear(points[points.length - 1])) return levelEditor.finishPath(false)
        points.push(snapped)
    },
    finishPath(isClosed) {
        const points = levelEditor.pathDraw ? levelEditor.pathDraw.points : []
        levelEditor.pathDraw = null
        levelEditor.renderLeft()
        if (points.length < (isClosed ? 3 : 2)) return
        const type = levelElements.types.path
        const el = levelElements.create("path", { closed: isClosed, ...type.styles[isClosed ? "closed" : "open"] })
        levelElements.setPoints(el, points)
        levelEditor.edit(`draw ${levelEditor.describe([el])}`, data => [levelData.add(data, el).id])
        levelEditor.select([el.id])
    },
    drawPathPreview() { //the points so far and a line to the mouse, the first point is bigger, clicking it closes the path
        const points = levelEditor.pathDraw.points.concat(levelEditor.snapPoint(levelEditor.mouse()))
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
        ctx.lineWidth = levelEditor.px(2)
        ctx.strokeStyle = levelEditor.colors.select
        ctx.setLineDash([levelEditor.px(6), levelEditor.px(4)])
        ctx.stroke()
        ctx.setLineDash([])
        points.slice(0, -1).forEach((p, i) => {
            ctx.beginPath()
            ctx.arc(p.x, p.y, levelEditor.px(i === 0 ? 7 : 4), 0, 2 * Math.PI)
            ctx.fillStyle = i === 0 ? "rgba(0,170,255,0.3)" : "#fff"
            ctx.fill()
            ctx.stroke()
        })
    },

    //*********************************************************************
    // vertex editing, the vertices button or V, for the selected map or block
    // a dot on each vertex to drag, and a smaller dot in the middle of each edge that adds a vertex when dragged
    //*********************************************************************
    vertexElement() {
        const vertex = levelEditor.vertex
        const el = vertex && levelData.find(levelEditor.data, vertex.id)
        return el && levelElements.isVertexEditable(el) ? el : null
    },
    vertexAt(point) { //{ index, isNew, point } for the vertex or edge dot under point
        const el = levelEditor.vertexElement()
        if (!el) return null
        const reach = levelEditor.px(8)
        const points = levelElements.points(el)
        const near = p => Math.abs(p.x - point.x) < reach && Math.abs(p.y - point.y) < reach
        const index = points.findIndex(near)
        if (index !== -1) return { index, isNew: false }
        const edges = levelElements.isOpen(el) ? points.length - 1 : points.length
        for (let i = 0; i < edges; i++) {
            const next = points[(i + 1) % points.length]
            const middle = { x: (points[i].x + next.x) / 2, y: (points[i].y + next.y) / 2 }
            if (near(middle)) return { index: i + 1, isNew: true, point: middle }
        }
        return null
    },
    setVertices(points, label) { //for the selected shape, from the sides buttons or typed vertices, label(summary) is its history label
        const el = levelEditor.vertexElement()
        if (!el) return
        const error = levelElements.checkPoints(points, el)
        levelEditor.vertex.error = error
        levelEditor.vertex.text = levelElements.pathText(el)
        if (error) return levelEditor.renderRight()
        if (!levelEditor.edit(label(levelEditor.describe([el])), () => {
            levelElements.setPoints(el, points)
            return [el.id]
        })) levelEditor.renderRight()
    },
    drawVertices(el) {
        const points = levelElements.points(el)
        const size = levelEditor.px(5)
        ctx.lineWidth = levelEditor.px(1.5)
        ctx.strokeStyle = levelEditor.colors.select
        ctx.beginPath()
        const edges = levelElements.isOpen(el) ? points.length - 1 : points.length
        for (let i = 0; i < edges; i++) { //edge dots
            const next = points[(i + 1) % points.length]
            const x = (points[i].x + next.x) / 2
            const y = (points[i].y + next.y) / 2
            ctx.moveTo(x + size * 0.6, y)
            ctx.arc(x, y, size * 0.6, 0, 2 * Math.PI)
        }
        ctx.fillStyle = "rgba(255,255,255,0.6)"
        ctx.fill()
        ctx.stroke()
        points.forEach((p, i) => {
            ctx.beginPath()
            ctx.arc(p.x, p.y, size, 0, 2 * Math.PI)
            ctx.fillStyle = i === levelEditor.vertex.active ? levelEditor.colors.select : "#fff"
            ctx.fill()
            ctx.stroke()
        })
    },

    //*********************************************************************
    // commands, run by buttons with data-command and data-arg, and by keys
    // keys are written like "mod+shift+z", mod is ctrl or ⌘
    //*********************************************************************
    commands: {
        undo: { label: "undo", keys: ["z", "mod+z"], run: () => levelEditor.undo() },
        redo: { label: "redo", keys: ["shift+z", "mod+shift+z", "mod+y"], run: () => levelEditor.redo() },
        rewind: { label: "rewind to here", run: index => levelEditor.rewind(Number(index)) },
        tool: {
            label: "draw tool", keys: ["c"], run(tool) { //no tool cycles to the next one
                const tools = levelEditor.tools
                levelEditor.tool = tool || tools[(tools.indexOf(levelEditor.tool) + 1) % tools.length]
                levelEditor.renderStatus()
            },
        },
        grid: {
            label: "grid lines", run() {
                levelEditor.isGridShown = !levelEditor.isGridShown
                levelEditor.renderStatus()
            },
        },
        history: { //the list of every change under undo and redo, click one to go back to it
            label: "history, click a step to go back to it", run(isOpen) {
                levelEditor.isHistoryOpen = isOpen === undefined || isOpen === "" ? !levelEditor.isHistoryOpen : !!isOpen
                const pop = document.getElementById("level-editor-history")
                pop.hidden = !levelEditor.isHistoryOpen
                if (levelEditor.isHistoryOpen) levelEditor.updateHistoryButtons()
                document.querySelector('#level-editor-status [data-command="history"]')?.classList.toggle("le-on", levelEditor.isHistoryOpen)
            },
        },
        deselect: {
            label: "deselect", keys: ["escape"], run() {
                levelEditor.drag = null
                if (levelEditor.isHistoryOpen) return levelEditor.run("history", false) //esc closes the history list first
                if (levelEditor.isAnalysisShown) return levelEditor.run("closeAnalysis") //then the analysis
                if (levelEditor.measure) { //then the ruler
                    levelEditor.measure = null
                    return
                }
                const code = document.getElementById("level-editor-code")
                if (code.classList.contains("le-open")) return code.classList.remove("le-open") //esc closes the javascript first
                if (levelEditor.picking) { //then stops picking
                    levelEditor.picking = null
                    return levelEditor.renderRight()
                }
                if (levelEditor.pathDraw) { //then stops drawing a path
                    levelEditor.pathDraw = null
                    return levelEditor.renderLeft()
                }
                if (levelEditor.vertex) { //esc leaves vertex editing first
                    levelEditor.vertex = null
                    return levelEditor.renderRight()
                }
                levelEditor.select([])
            },
        },
        vertices: {
            label: "edit vertices", keys: ["v"], run() {
                const selected = levelEditor.selected()
                if (levelEditor.vertex) {
                    levelEditor.vertex = null
                } else if (selected.length === 1 && levelElements.isVertexEditable(selected[0])) {
                    levelEditor.vertex = { id: selected[0].id, active: -1, error: "", text: "" }
                }
                levelEditor.renderRight()
            },
        },
        sides: { //a regular shape with one more or one less side, filling the shape's bounds
            label: "sides", run(change) {
                const el = levelEditor.vertexElement()
                if (!el) return
                const sides = Math.min(levelElements.vertexLimit, Math.max(3, levelElements.points(el).length + Number(change)))
                levelEditor.setVertices(levelElements.regularPoints(levelElements.bounds(el), sides), summary => `${summary} to ${sides} sides`)
            },
        },
        rotate: { //the selection turns around its middle, one element around its own pivot, see levelElements.rotate()
            label: "rotate 90° clockwise", run(degrees) {
                const elements = levelEditor.selected().filter(el => !levelElements.types[el.type]?.isCode)
                if (!elements.length || !elements.some(levelElements.isRotatable)) return
                const turn = Number(degrees) || 90
                let center
                if (elements.length === 1) {
                    center = levelElements.pivot(elements[0])
                } else {
                    const b = levelElements.boundsOf(elements.flatMap(el => levelElements.points(levelElements.bounds(el))))
                    center = levelEditor.snapPoint({ x: b.x + b.width / 2, y: b.y + b.height / 2 })
                }
                levelEditor.edit(`rotate ${levelEditor.describe(elements)} ${turn}°`, () => {
                    for (const el of elements) levelElements.rotate(el, turn, center)
                    return elements.map(el => el.id)
                })
            },
        },
        selectAll: { label: "select all", keys: ["mod+a"], run: () => levelEditor.select(levelEditor.data.elements.map(el => el.id)) },
        delete: {
            label: "delete", keys: ["delete", "backspace"], run(isCut = false) {
                if (levelEditor.pathDraw) return levelEditor.pathDraw.points.pop() //the last point of the path being drawn
                const vertexEl = levelEditor.vertexElement()
                if (vertexEl && levelEditor.vertex.active !== -1) { //while editing vertices, delete removes the clicked vertex
                    const index = levelEditor.vertex.active
                    const points = levelElements.points(vertexEl)
                    points.splice(index, 1)
                    const error = levelElements.checkPoints(points, vertexEl)
                    if (error) return simulation.inGameConsole(`<em>//shape ${error}</em>`)
                    levelEditor.edit(`remove vertex ${index} ${levelEditor.describe([vertexEl])}`, () => {
                        levelElements.setPoints(vertexEl, points)
                        return [vertexEl.id]
                    })
                    levelEditor.vertex.active = -1
                    return
                }
                const elements = levelEditor.selected().filter(el => !levelEditor.isSingleton(el) && (!isCut || levelEditor.isCopyable(el)))
                const ids = elements.map(el => el.id)
                if (!ids.length) return
                for (const el of levelEditor.data.elements) { //constraints go with the block they hold
                    if (levelElements.types[el.type]?.rebuildWithRefs && levelElements.refKeys(el).some(key => ids.includes(el[key])) && !ids.includes(el.id)) ids.push(el.id)
                }
                levelEditor.edit(`delete ${levelEditor.describe(elements)}`, data => {
                    data.elements = data.elements.filter(el => !ids.includes(el.id))
                    for (const el of data.elements) { //links to a deleted button go away
                        for (const key of levelElements.refKeys(el)) if (ids.includes(el[key])) el[key] = null
                    }
                    return ids
                })
            },
        },
        copy: { label: "copy", keys: ["mod+c"], run: () => { levelEditor.clipboard = levelEditor.selected().filter(levelEditor.isCopyable).map(levelData.copy) } },
        cut: {
            label: "cut", keys: ["mod+x"], run() {
                levelEditor.run("copy")
                levelEditor.commands.delete.run(true)
            },
        },
        paste: { //the copied elements' top left corner goes to the mouse
            label: "paste", keys: ["mod+v"], run() {
                if (!levelEditor.clipboard.length) return
                const box = levelElements.boundsOf(levelEditor.clipboard.flatMap(el => levelElements.points(el)))
                const to = levelEditor.snapPoint(levelEditor.mouse())
                levelEditor.paste("paste", levelEditor.clipboard, to.x - levelEditor.snap(box.x), to.y - levelEditor.snap(box.y))
            },
        },
        duplicate: {
            label: "duplicate", keys: ["mod+d"], run() {
                const offset = Math.max(25, levelEditor.grid)
                levelEditor.paste("duplicate", levelEditor.selected().filter(levelEditor.isCopyable), offset, offset)
            },
        },
        add: { //an element from an add menu, in the middle of the view, "powerUp:heal" uses the type's preset("heal"), or drag it onto the level
            label: "add", run: arg => levelEditor.place(levelEditor.creation("add", arg)),
        },
        drawPath: { //click to add points, click the first point to close it, click the last point, enter, or right click to finish
            label: "draw a path, click to add points, click the first point to close it, enter or right click to finish", run() {
                if (levelEditor.pathDraw) return levelEditor.finishPath(false)
                levelEditor.pathDraw = { points: [] }
                levelEditor.select([])
                levelEditor.renderLeft()
            },
        },
        pick: { //click an element for a ref prop of the selected element
            label: "pick it by clicking it, esc stops", run(key) {
                const el = levelEditor.selected()[0]
                levelEditor.picking = levelEditor.picking ? null : el ? { id: el.id, key } : null
                levelEditor.renderRight()
            },
        },
        pickLink: { //click an element to link it to the selected button or toggle
            label: "link something by clicking it, esc stops", run() {
                const el = levelEditor.selected()[0]
                levelEditor.picking = levelEditor.picking ? null : el ? { id: el.id, isLink: true } : null
                levelEditor.renderRight()
            },
        },
        fullTest: { //the export JS, everything a run would do
            label: "play the level's export JS like a run, editing anything stops it", run() {
                levelEditor.isFullTest = !levelEditor.isFullTest
                levelEditor.isPanelsHidden = levelEditor.isFullTest //see the level like a player, tab shows the panels
                levelEditor.updatePanels()
                levelEditor.isTesting = false
                levelEditor.drag = null
                levelEditor.picking = null
                levelEditor.pathDraw = null
                levelEditor.vertex = null
                levelEditor.renderLeft()
                levelEditor.restart()
            },
        },
        editCode: {
            label: "edit the code, ⌘enter applies", run(id) {
                const el = levelData.find(levelEditor.data, Number(id) || levelEditor.selection[0])
                if (!el) return
                levelEditor.codeEditing = el.id
                levelEditor.openPanel(`code #${el.id}`, el.code, "", "code")
            },
        },
        applyCode: { //the code panel's apply button
            label: "apply, the level runs again", run() {
                const text = document.querySelector("#level-editor-code textarea").value
                if (levelEditor.codeEditing === "new") { //+ code, added at the end of the level, nothing typed adds nothing
                    levelEditor.run("closeCode")
                    if (!text.trim()) return
                    const el = levelElements.create("code", { code: text.replace(/\s+$/, "") })
                    levelEditor.edit("add code", data => [levelData.add(data, el).id])
                    return levelEditor.select([el.id])
                }
                const el = levelData.find(levelEditor.data, levelEditor.codeEditing)
                if (!el) return
                levelEditor.run("closeCode")
                levelEditor.edit(`edit ${levelEditor.describe([el])}`, () => {
                    el.code = text
                    return [el.id]
                })
            },
        },
        addCode: { //the code panel, applying adds code at the end of the level, after everything else
            label: "javascript that runs as part of the level, after everything above it", run() {
                levelEditor.codeEditing = "new"
                levelEditor.openPanel("new code", "", "", "code")
                document.querySelector("#level-editor-code textarea").placeholder = "paste or write javascript, apply or ⌘enter runs it as part of the level"
            },
        },
        selectId: { label: "select", run: id => levelEditor.select([Number(id)]) },
        unlink: {
            label: "unlink", run(id) {
                const el = levelData.find(levelEditor.data, Number(id))
                if (!el) return
                levelEditor.edit(`unlink ${levelEditor.describe([el])}`, () => {
                    el.link = null
                    return [el.id]
                })
            },
        },
        constrain: { //a constraint from a point above the selected block, drag the point where it goes
            label: "hold it with a Matter.js constraint to a point in the level", run() {
                const el = levelEditor.selected()[0]
                if (!el || el.type !== "block") return
                const c = levelElements.center(el)
                const anchor = levelEditor.snapPoint({ x: c.x, y: c.y - 200 })
                const constraint = levelElements.create("constraint", { x: anchor.x, y: anchor.y, body: el.id, length: Math.round(c.y - anchor.y) })
                levelEditor.edit(`add ${levelEditor.describe([constraint])}`, data => [levelData.add(data, constraint).id])
                levelEditor.select([constraint.id])
            },
        },
        finishPath: { label: "finish the path", keys: ["enter"], run: () => levelEditor.pathDraw && levelEditor.finishPath(false) },
        preset: { //a common shape from levelElements.presets, as map, or block with the block tool, in the middle of the view, or drag it onto the level
            label: "shape", run: name => levelEditor.place(levelEditor.creation("preset", name)),
        },
        timeScale: { //the simulation menu's game speed
            label: "game speed", run(scale) {
                levelEditor.timeScale = Number(scale) || 1
                levelEditor.renderLeft()
            },
        },
        debugDraw: { //the simulation menu's draw toggles, see drawDebug()
            label: "draw", run(name) {
                if (levelEditor.debugDraw.has(name)) levelEditor.debugDraw.delete(name)
                else levelEditor.debugDraw.add(name)
                levelEditor.renderLeft()
            },
        },
        inspectMode: { //the inspector's { } and js
            label: "props, or the export JS this element writes", run(mode) {
                levelEditor.inspectMode = mode === "js" ? "js" : "props"
                levelEditor.renderRight()
            },
        },
        jumpTo: { //the explorer, select it and go to it
            label: "select it and go to it", run(id) {
                const el = levelData.find(levelEditor.data, Number(id))
                if (!el) return
                const b = levelElements.bounds(el)
                levelEditor.pan = { x: b.x + b.width / 2 - m.pos.x, y: b.y + b.height / 2 - m.pos.y }
                levelEditor.select([el.id])
            },
        },
        hide: { //"type:map" or "id:12", hidden elements aren't built while editing
            label: "hide while editing, tests show it", run(arg) {
                const ids = levelEditor.toggleView(levelEditor.hiddenTypes, levelEditor.hiddenIds, arg)
                levelEditor.select(levelEditor.selection.filter(id => !levelEditor.isHidden(levelData.find(levelEditor.data, id))))
                if (!levelEditor.isTesting && !levelEditor.isFullTest) levelData.rebuild(ids)
            },
        },
        lock: { //"type:map" or "id:12", the mouse goes through locked elements
            label: "the mouse goes through it, the explorer still selects it", run(arg) {
                levelEditor.toggleView(levelEditor.lockedTypes, levelEditor.lockedIds, arg)
                levelEditor.select(levelEditor.selection.filter(id => !levelEditor.isLocked(levelData.find(levelEditor.data, id))))
            },
        },
        panels: { //hide the panels to see the level like a player does, full test hides them too
            label: "hide or show the editor panels", keys: ["tab"], run() {
                levelEditor.isPanelsHidden = !levelEditor.isPanelsHidden
                levelEditor.updatePanels()
            },
        },
        addSpot: { //another place the selected boss could spawn, drag it where it goes
            label: "another place it could spawn", run() {
                const el = levelEditor.selected()[0]
                if (!el || !Array.isArray(el.spots)) return
                const last = el.spots.length ? el.spots[el.spots.length - 1] : [el.x, el.y]
                const spot = [last[0] + 300, last[1]]
                levelEditor.edit(`${levelEditor.describe([el])} add spot ${levelEditor.formatValue(spot[0])}, ${levelEditor.formatValue(spot[1])}`, () => {
                    el.spots.push(spot)
                    return [el.id]
                })
            },
        },
        removeSpot: {
            label: "remove this spot", run(index) {
                const el = levelEditor.selected()[0]
                if (!el || !Array.isArray(el.spots)) return
                levelEditor.edit(`${levelEditor.describe([el])} remove spot ${Number(index) + 2}`, () => {
                    el.spots.splice(Number(index), 1)
                    return [el.id]
                })
            },
        },
        shape: { //switch selected map and blocks to the other one
            label: "map or block", run(typeName) {
                const shapes = levelEditor.selected().filter(el => levelElements.groups.shape.includes(el.type) && el.type !== typeName)
                const ids = shapes.map(el => el.id)
                levelEditor.edit(`${levelEditor.describe(shapes)} to ${typeName}`, data => {
                    data.elements = data.elements.map(el => {
                        if (!ids.includes(el.id)) return el
                        const shared = { friction: el.friction, restitution: el.restitution }
                        return { ...levelElements.create(typeName, { ...levelElements.shapeGeometry(el), ...shared }), id: el.id }
                    })
                    return ids
                })
            },
        },
        test: { //start restarts the level at the spawn with blocks back in place, and mobs and power ups if the box is checked, stop restarts it without them
            label: "restart the level at the enter to play it, again to stop", run() {
                levelEditor.isTesting = !levelEditor.isTesting || levelEditor.isFullTest
                levelEditor.isFullTest = false
                levelEditor.renderLeft()
                levelEditor.restart()
            },
        },
        code: {
            label: "level as javascript", run() {
                levelEditor.openPanel(`${levelData.functionName(levelEditor.data.name)}()`, levelData.code(levelEditor.data))
            },
        },
        matchZoom: { label: "zoom like the level is played, its zoom in level properties", run: () => levelEditor.zoomTo(levelEditor.data.zoom) },
        importLevel: {
            label: "paste a level's javascript, it replaces this level", run() {
                levelEditor.openPanel("import level", "", "", "import")
            },
        },
        importText: { //the import panel's import button
            label: "replace this level with the pasted javascript", run() {
                const text = document.querySelector("#level-editor-code textarea").value
                if (!text.trim()) return
                let imported, isCaptured
                try {
                    ({ data: imported, isCaptured } = levelData.fromText(text))
                } catch (error) {
                    console.error(error)
                    simulation.inGameConsole(`<em>//couldn't import that, ${levelEditor.escape(error.message)}</em>`)
                    return levelEditor.restart() //running the code cleared the world
                }
                levelEditor.run("closeCode")
                levelEditor.select([])
                levelEditor.edit("import level", data => { //one undo step, the name stays, it's where the level is saved
                    const name = data.name
                    for (const key of Object.keys(data)) delete data[key]
                    Object.assign(data, imported, { name })
                    return []
                })
                levelEditor.applyLevelProps()
                levelEditor.renderLeft()
                levelEditor.restart(false)
                simulation.inGameConsole(`<em>//imported ${imported.elements.length} elements${isCaptured ? ", only the map and blocks, the code had no level editor data" : ""}</em>`)
            },
        },
        analyze: { //the analysis in the inspector, click a line to go to what it's about
            label: "issues, the level checked against the written levels", run() {
                levelEditor.analysisReport = levelAnalysis.run(levelEditor.data, { isLive: true })
                levelEditor.isAnalysisShown = true
                levelEditor.renderRight()
            },
        },
        closeAnalysis: {
            label: "back to what's selected", run() {
                levelEditor.isAnalysisShown = false
                levelEditor.renderRight()
            },
        },
        copyAnalysis: {
            label: "copy the issues as text", run: () => levelEditor.copy(levelAnalysis.text(levelEditor.analysisReport || levelAnalysis.run(levelEditor.data, { isLive: true })), "issues"),
        },
        fixProblem: { //an analysis line that adding something fixes, like no boss, adds it somewhere sensible, goes to it, and keeps the analysis open
            label: "add it", run(typeName) {
                levelEditor.isAnalysisJump = true
                levelEditor.place(levelEditor.creation("add", typeName, levelEditor.fixSpot(typeName) || undefined))
                const id = levelEditor.selection[0]
                if (id !== undefined) levelEditor.run("jumpTo", id)
                levelEditor.isAnalysisJump = false
                levelEditor.countProblems(0)
            },
        },
        jumpProblem: { //an analysis line, select what it's about and go to it, more than one goes to the next each click
            label: "go to it", run(arg) {
                const ids = String(arg).split(",").map(Number).filter(id => levelData.find(levelEditor.data, id))
                if (!ids.length) return
                const index = ((levelEditor.analysisCursor.get(arg) ?? -1) + 1) % ids.length
                levelEditor.analysisCursor.set(arg, index)
                levelEditor.isAnalysisJump = true
                levelEditor.run("jumpTo", ids[index])
                levelEditor.isAnalysisJump = false
            },
        },
        copyPanel: {
            label: "copy", run() {
                const panel = document.getElementById("level-editor-code")
                levelEditor.copy(panel.querySelector("textarea").value, panel.querySelector("[data-code-name]").textContent)
            },
        },
        pool: { //in or out of the random level pool from settings, without opening it
            label: "add it to the random level pool for runs, or take it out", run() {
                const pool = localSettings.levelPool
                const name = levelEditor.data.name
                pool.added = levelEditor.isInPool() ? pool.added.filter(n => n !== name) : pool.added.concat(name)
                if (localSettings.isAllowed) localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update local storage
                simulation.inGameConsole(levelEditor.isInPool() ? `<em>//${name} is in the level pool</em>` : `<em>//${name} is out of the level pool</em>`)
                levelEditor.renderLeft()
            },
        },
        closeCode: { label: "close", run: () => document.getElementById("level-editor-code").classList.remove("le-open") },
        levelDefaults: { //the level properties most written levels use, the name stays
            label: "typical level properties", run() {
                const defaults = levelElements.level.defaults()
                levelEditor.edit("level properties to default", data => {
                    Object.assign(data, defaults)
                    return []
                })
                levelEditor.applyLevelProps()
            },
        },
        newLevel: { label: "a new level with ground, an enter, and an exit", run: () => levelEditor.setData(levelData.blank(levelData.freeName("untitled"))) },
        load: { label: "load", run: arg => levelEditor.load(arg) },
        deleteLevel: {
            label: "delete level", run(name) {
                if (!confirm(`delete ${name}?`)) return
                if (name === levelEditor.data.name) {
                    clearTimeout(levelEditor.saveTimer)
                    levelEditor.saveTimer = null //switching levels must not save the deleted level again
                }
                levelData.store.remove(name)
                if (name === levelEditor.data.name) {
                    const next = levelData.store.names()[0]
                    levelEditor.setData(next ? levelData.store.get(next) : levelData.blank(levelData.freeName("untitled")))
                } else {
                    levelEditor.renderLeft()
                }
            },
        },
        exit: { label: "exit editor", run: () => levelEditor.exit() },
    },
    run(name, arg) {
        levelEditor.commands[name].run(arg)
    },
    keyCombo(event) {
        return (event.ctrlKey || event.metaKey ? "mod+" : "") + (event.shiftKey ? "shift+" : "") + event.key.toLowerCase()
    },
    keyText(combo) { //for tooltips
        const isMac = /Mac|iPhone|iPad/.test(navigator.platform)
        return combo.replace("mod+", isMac ? "⌘" : "ctrl+").replace("shift+", isMac ? "⇧" : "shift+").toUpperCase()
    },
    tip(name) {
        const command = levelEditor.commands[name]
        return command.keys ? `${command.label}  ${levelEditor.keyText(command.keys[0])}` : command.label
    },
    keyDown(event) {
        levelEditor.isFree = event.altKey
        if (!levelEditor.isActive || simulation.paused || event.target.closest?.("input, textarea, select, .le-panel")) return
        const combo = levelEditor.keyCombo(event)
        if (!combo.includes("mod+") && Object.values(input.key).includes(event.code)) return //a key the player set for the game, like jump, stays a game key
        for (const name of Object.keys(levelEditor.commands)) {
            const keys = levelEditor.commands[name].keys
            if (keys && keys.includes(combo)) {
                event.preventDefault()
                event.stopImmediatePropagation() //game keys don't also run
                levelEditor.run(name)
                return
            }
        }
    },
    unstack(el, also = []) { //power ups spawned in the same spot lag while the game pushes them apart, so a new one moves 25 in a random direction until it has its own spot
        if (levelElements.types[el.type]?.group !== "powerUp" || el.type === "debris") return
        const isTaken = () => levelEditor.data.elements.concat(also).some(other => other !== el && levelElements.types[other.type]?.group === "powerUp" && other.type !== "debris" && other.x === el.x && other.y === el.y)
        const steps = [[25, 0], [-25, 0], [0, 25], [0, -25], [25, 25], [25, -25], [-25, 25], [-25, -25]]
        for (let i = 0; i < 50 && isTaken(); i++) {
            const [dx, dy] = steps[Math.floor(Math.random() * steps.length)]
            levelElements.move(el, dx, dy)
        }
    },
    paste(label, elements, dx, dy) {
        if (!elements.length) return
        const copies = elements.map(original => {
            const el = levelData.copy(original)
            levelElements.move(el, dx, dy, true)
            return el
        })
        for (const el of copies) levelEditor.unstack(el, copies)
        const ids = []
        levelEditor.edit(`${label} ${levelEditor.describe(copies)}`, data => {
            for (const el of copies) ids.push(levelData.add(data, el).id)
            const newIds = new Map(elements.map((original, i) => [original.id, ids[i]])) //a copied button and door stay linked to each other, not to the originals
            for (const el of copies) {
                for (const key of levelElements.refKeys(el)) if (newIds.has(el[key])) el[key] = newIds.get(el[key])
            }
            return ids
        })
        levelEditor.select(ids)
    },
    async load(arg) { //"local:name" opens a local level, "written:name" and "more:name" copy a written level into a new local level
        const split = arg.indexOf(":")
        const source = arg.slice(0, split)
        const name = arg.slice(split + 1)
        if (source === "local") {
            if (name !== levelEditor.data.name && levelData.store.has(name)) levelEditor.setData(levelData.store.get(name))
            return
        }
        try {
            if (source === "more") await level.loadMoreLevels()
            levelEditor.flush()
            const data = levelData.capture(name)
            levelEditor.setData(data)
            simulation.inGameConsole(`<span class='color-var'>levelData</span>.capture(<span class='color-text'>"${name}"</span>) <em>//as ${data.name}</em>`)
        } catch (error) {
            console.error(error)
            simulation.inGameConsole(`<em>//couldn't load ${name}</em>`)
            levelEditor.restart() //capture cleared the world
        }
    },

    //*********************************************************************
    // drawing, runs each cycle as an ephemera, after the map is drawn
    //*********************************************************************
    colors: {
        select: "rgb(0,170,255)",
        pick: "rgb(255,120,0)",
        hover: "rgba(0,170,255,0.6)",
        guide: "rgba(0,120,255,0.4)",
        grid: "rgba(0,0,0,0.06)",
        axis: "rgba(0,0,0,0.15)",
    },
    frame() {
        levelEditor.applyTimeScale()
        if (!levelEditor.isActive || levelEditor.isFullTest) return //full test looks like a run
        if (levelEditor.debugDraw.size) levelEditor.drawDebug()
        if (++levelEditor.readoutCycle % 10 === 0) levelEditor.updateReadout()
        const point = levelEditor.mouse()
        const drag = levelEditor.drag
        const hover = drag || levelEditor.pathDraw || !levelEditor.isMouseOnCanvas ? null : levelEditor.elementAt(point)
        levelEditor.hoverId = hover ? hover.id : null
        if (levelEditor.picking) { //what can be picked, and the one under the mouse
            for (const el of levelEditor.data.elements) if (levelEditor.canPick(el)) levelEditor.outline(el, levelEditor.colors.pick, el === hover ? 3 : 1.5, el === hover ? [] : [6, 4])
        }
        if (levelEditor.isGridShown) levelEditor.drawGrid()
        levelEditor.drawGuides()
        levelEditor.drawProblems()
        if (hover && !levelEditor.selection.includes(hover.id)) levelEditor.outline(hover, levelEditor.colors.hover, 1.5)
        const isDragging = drag && (drag.kind === "move" || drag.kind === "handle" || drag.kind === "vertex")
        for (const el of levelEditor.selected()) levelEditor.outline(el, levelEditor.colors.select, 2, isDragging ? [6, 4] : [])
        if (drag && drag.kind === "vertex") {
            const { points, error } = levelEditor.vertexPreview(drag)
            levelEditor.outlinePoints(points, error ? "#e00" : levelEditor.colors.select, 2, error ? "rgba(255,0,0,0.15)" : "rgba(0,170,255,0.15)", levelElements.isOpen(levelData.find(levelEditor.data, drag.id)))
            if (error) { //on a light box so it shows over the map
                const x = point.x + levelEditor.px(14)
                const y = point.y + levelEditor.px(22)
                ctx.font = `${levelEditor.px(12)}px monospace`
                ctx.textAlign = "left" //other drawing can leave it centered
                ctx.textBaseline = "alphabetic"
                ctx.fillStyle = "rgba(255,255,255,0.85)"
                ctx.fillRect(x - levelEditor.px(3), y - levelEditor.px(12), ctx.measureText(error).width + levelEditor.px(6), levelEditor.px(16))
                ctx.fillStyle = "#c00"
                ctx.fillText(error, x, y)
            }
        } else if (isDragging) {
            for (const el of levelEditor.dragPreview(drag)) levelEditor.outline(el, levelEditor.colors.select, 2, [], "rgba(0,170,255,0.15)")
        } else if (levelEditor.vertexElement()) {
            levelEditor.drawVertices(levelEditor.vertexElement())
        } else if (levelEditor.selection.length === 1) {
            levelEditor.drawHandles(levelEditor.selected()[0])
        }
        if (drag && (drag.kind === "draw" || drag.kind === "box")) levelEditor.drawDragRect(drag)
        if (levelEditor.pathDraw && levelEditor.pathDraw.points.length) levelEditor.drawPathPreview()
        const palette = levelEditor.paletteDrag
        if (palette && palette.isDragging && levelEditor.isMouseOnCanvas) { //where an add button being dragged would go
            const made = levelEditor.creation(palette.command, palette.arg, point)
            if (made) for (const el of made.elements) levelEditor.outline(el, levelEditor.colors.select, 2, [6, 4], "rgba(0,170,255,0.15)")
        }
        if (drag && drag.kind === "measure") levelEditor.measure.end = levelEditor.snapPoint(point)
        if (levelEditor.measure) levelEditor.drawMeasure(levelEditor.measure)
        if (levelEditor.isMouseOnCanvas) levelEditor.drawLabel(point)
        if (hover && !drag && levelEditor.problems.has(hover.id)) levelEditor.drawTip(point, levelEditor.problems.get(hover.id))
        levelEditor.updateStatusMouse(point)
    },
    //*********************************************************************
    // simulation menu, measure tool, and physics numbers
    //*********************************************************************
    debugLayers: [ //[name, tooltip], drawn over the level by drawDebug()
        ["wireframe", "every body's outline, map, blocks, mobs, the player, power ups, and bullets"],
        ["bounds", "each body's axis aligned bounding box, it stretches with velocity"],
        ["velocity", "each moving body's velocity, 5 frames long"],
        ["constraints", "every Matter constraint, its two points and the line between them"],
        ["centers", "each body's center of mass and angle"],
        ["collisions", "contact points between bodies touching this frame"],
    ],
    applyTimeScale() { //slow motion by lowering the frame cap, the game takes one physics step a frame
        const scale = levelEditor.isActive && !levelEditor.isFullTest ? levelEditor.timeScale : 1
        if (scale !== 1) {
            const fps = Math.round(60 * scale)
            if (simulation.fpsCap !== fps) { //taking damage and new levels set it back
                simulation.fpsCap = fps
                simulation.fpsInterval = 1000 / fps
            }
            levelEditor.isTimeScaled = true
        } else if (levelEditor.isTimeScaled) {
            levelEditor.isTimeScaled = false
            simulation.fpsCap = simulation.fpsCapDefault
            simulation.fpsInterval = 1000 / simulation.fpsCap
        }
    },
    drawDebug() {
        const layers = levelEditor.debugDraw
        const bodies = Composite.allBodies(engine.world)
        const width = levelEditor.px(1)
        if (layers.has("bounds")) {
            ctx.beginPath()
            for (const who of bodies) ctx.rect(who.bounds.min.x, who.bounds.min.y, who.bounds.max.x - who.bounds.min.x, who.bounds.max.y - who.bounds.min.y)
            ctx.lineWidth = width
            ctx.strokeStyle = "rgba(255,0,200,0.35)"
            ctx.stroke()
        }
        if (layers.has("wireframe")) {
            ctx.beginPath()
            for (const who of bodies) {
                for (let i = who.parts.length > 1 ? 1 : 0; i < who.parts.length; i++) {
                    const v = who.parts[i].vertices
                    ctx.moveTo(v[0].x, v[0].y)
                    for (let j = 1; j < v.length; j++) ctx.lineTo(v[j].x, v[j].y)
                    ctx.lineTo(v[0].x, v[0].y)
                }
            }
            ctx.lineWidth = width
            ctx.strokeStyle = "rgba(0,200,120,0.9)"
            ctx.stroke()
        }
        if (layers.has("centers")) {
            ctx.beginPath()
            for (const who of bodies) {
                const r = levelEditor.px(3)
                ctx.moveTo(who.position.x + r, who.position.y)
                ctx.arc(who.position.x, who.position.y, r, 0, 2 * Math.PI)
                ctx.moveTo(who.position.x, who.position.y)
                ctx.lineTo(who.position.x + levelEditor.px(12) * Math.cos(who.angle), who.position.y + levelEditor.px(12) * Math.sin(who.angle))
            }
            ctx.lineWidth = width
            ctx.strokeStyle = "rgba(0,0,0,0.7)"
            ctx.stroke()
        }
        if (layers.has("velocity")) {
            ctx.beginPath()
            for (const who of bodies) {
                if (who.isStatic || who.speed < 0.05) continue
                ctx.moveTo(who.position.x, who.position.y)
                ctx.lineTo(who.position.x + 5 * who.velocity.x, who.position.y + 5 * who.velocity.y)
            }
            ctx.lineWidth = levelEditor.px(1.5)
            ctx.strokeStyle = "rgba(255,90,0,0.9)"
            ctx.stroke()
        }
        if (layers.has("constraints")) {
            ctx.beginPath()
            for (const c of Composite.allConstraints(engine.world)) {
                const a = c.bodyA ? Vector.add(c.bodyA.position, c.pointA) : c.pointA
                const b = c.bodyB ? Vector.add(c.bodyB.position, c.pointB) : c.pointB
                ctx.moveTo(a.x, a.y)
                ctx.lineTo(b.x, b.y)
                ctx.moveTo(a.x + levelEditor.px(3), a.y)
                ctx.arc(a.x, a.y, levelEditor.px(3), 0, 2 * Math.PI)
                ctx.moveTo(b.x + levelEditor.px(3), b.y)
                ctx.arc(b.x, b.y, levelEditor.px(3), 0, 2 * Math.PI)
            }
            ctx.lineWidth = levelEditor.px(1.5)
            ctx.strokeStyle = "rgba(120,0,255,0.8)"
            ctx.stroke()
        }
        if (layers.has("collisions")) {
            ctx.beginPath()
            for (const pair of engine.pairs.list) {
                if (!pair.isActive) continue
                for (const support of pair.collision.supports) {
                    ctx.moveTo(support.x + levelEditor.px(2.5), support.y)
                    ctx.arc(support.x, support.y, levelEditor.px(2.5), 0, 2 * Math.PI)
                }
            }
            ctx.fillStyle = "rgba(255,0,0,0.9)"
            ctx.fill()
        }
    },
    readoutText() { //numbers about the running simulation, the simulation menu shows them
        if (!levelEditor.isActive || typeof engine === "undefined") return ""
        const f = (n, digits = 2) => Number.isFinite(n) ? n.toFixed(digits) : "-"
        let customMs = 0
        let topMs = 0
        for (const runtime of levelData.runtimes.values()) {
            customMs += runtime.customMs || 0
            topMs += runtime.topMs || 0
        }
        return [
            `bodies ${Composite.allBodies(engine.world).length}  cons ${Composite.allConstraints(engine.world).length}  pairs ${engine.pairs.list.filter(pair => pair.isActive).length}`,
            `map ${map.length}  body ${body.length}  mob ${mob.length}`,
            `powerUp ${powerUp.length}  bullet ${bullet.length}`,
            `custom ${f(customMs, 3)}ms  top ${f(topMs, 3)}ms`,
            `g ${simulation.g.toFixed(5)}  cycle ${simulation.cycle}  fps ${simulation.fpsCap > 1000 ? "max" : Math.round(simulation.fpsCap)}`,
            `pos (${f(player.position.x, 0)}, ${f(player.position.y, 0)})  vel (${f(player.velocity.x)}, ${f(player.velocity.y)})`,
            `mass ${f(player.mass)}  onGround ${m.onGround}`,
        ].join("\n")
    },
    updateReadout() {
        const pre = document.querySelector("#level-editor-left [data-readout]")
        if (pre && pre.closest("details").open) pre.textContent = levelEditor.readoutText()
    },
    jumpReach() { //how high and far the player jumps, measured in headless Chrome on flat ground: 390 high standing, 570 long running at full speed
        const force = (m.jumpForce / 0.42) * (5 / player.mass) //tech and field changes, the jump's starting speed goes with it
        const gravity = levelEditor.data.gravity || 1
        return { height: 390 * force * force / gravity, distance: 570 * force / gravity }
    },
    canReach(start, end) { //could a jump from standing at start land at end, as high as a jump goes for half its distance, then falling
        const { height, distance } = levelEditor.jumpReach()
        const across = Math.abs(end.x - start.x)
        const reach = across <= distance / 2 ? height : height * (1 - ((across - distance / 2) / (distance / 2)) ** 2)
        return start.y - end.y <= reach
    },
    drawMeasure({ start, end }) { //the ruler, its numbers, and the jump arc from its start
        const px = levelEditor.px
        const { height, distance } = levelEditor.jumpReach()
        const isReach = levelEditor.canReach(start, end)
        ctx.lineWidth = px(1.5)
        ctx.strokeStyle = "rgba(0,120,255,0.45)"
        ctx.setLineDash([px(6), px(5)])
        ctx.beginPath() //how far a jump reaches both ways: as high as a jump goes for half its distance, then falling, past where it lands
        const reach = across => across <= distance / 2 ? height : height * (1 - ((across - distance / 2) / (distance / 2)) ** 2)
        for (const side of [-1, 1]) {
            for (let i = 0; i <= 40; i++) {
                const across = 1.5 * distance * i / 40
                const x = start.x + side * across
                const y = start.y - reach(across)
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
            }
        }
        ctx.stroke()
        ctx.setLineDash([])
        ctx.beginPath() //the ruler
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.lineWidth = px(2)
        ctx.strokeStyle = isReach ? "#0a6" : "#d22"
        ctx.stroke()
        for (const p of [start, end]) {
            ctx.beginPath()
            ctx.arc(p.x, p.y, px(4), 0, 2 * Math.PI)
            ctx.fillStyle = "#fff"
            ctx.fill()
            ctx.stroke()
        }
        const f = levelEditor.formatValue
        const dx = end.x - start.x
        const dy = end.y - start.y
        const lines = [
            `dx ${f(dx)}  dy ${f(dy)}  d ${f(Number(Math.hypot(dx, dy).toFixed(1)))}  θ ${f(Number((Math.atan2(-dy, dx) * 180 / Math.PI).toFixed(1)))}°`,
            `jump ≈${Math.round(height)} up  ≈${Math.round(distance)} across  ${isReach ? "reach ✓" : "reach ✗"}`,
        ]
        ctx.font = `${px(12)}px monospace`
        ctx.textAlign = "left"
        ctx.textBaseline = "alphabetic"
        const width = Math.max(...lines.map(line => ctx.measureText(line).width))
        const screenX = (end.x + m.transX - canvas.width2) * simulation.zoom + canvas.width2
        const x = screenX + (width + px(20)) * simulation.zoom < canvas.width - 300 ? end.x + px(10) : end.x - px(10) - width //left of the end near the inspector
        const y = end.y - px(10)
        ctx.fillStyle = "rgba(255,255,255,0.85)"
        ctx.fillRect(x - px(4), y - px(13), width + px(8), px(36))
        ctx.fillStyle = "#000"
        ctx.fillText(lines[0], x, y)
        ctx.fillStyle = isReach ? "#0a6" : "#d22"
        ctx.fillText(lines[1], x, y + px(16))
    },
    physicsText(el) { //read only numbers under an element's props, from its bodies in the world
        const runtime = levelData.runtimes.get(el.id)
        const g = n => Number(n.toPrecision(3))
        const parts = []
        if (runtime && runtime.bodies && runtime.bodies.length) {
            const who = runtime.bodies[0]
            parts.push(`mass ${g(who.mass)}`, `area ${g(who.area)}`, `inertia ${who.inertia.toExponential(2)}`)
            if (runtime.bodies.length > 1) parts.push(`bodies ${runtime.bodies.length}`)
        } else if (runtime && runtime.maps && runtime.maps.length) {
            const who = runtime.maps[0]
            parts.push(`area ${g(who.area)}`, `vertices ${who.vertices.length}`, "static")
            if (runtime.maps.length > 1) parts.push(`maps ${runtime.maps.length}`)
        }
        return parts.length ? `<div class="le-comment le-physics">//${parts.join(" · ")}</div>` : ""
    },
    updateSelectionStatus() { //the status bar's count, bounds, and mass of what's selected
        const span = document.querySelector("#level-editor-status [data-status-selection]")
        if (!span) return
        const elements = levelEditor.selected()
        if (!elements.length) return span.textContent = ""
        const b = levelElements.boundsOf(elements.flatMap(el => levelElements.points(levelElements.bounds(el))))
        let mass = 0
        for (const el of elements) for (const who of levelData.runtimes.get(el.id)?.bodies || []) mass += who.mass
        span.textContent = `${elements.length} sel · ${Math.round(b.width)}×${Math.round(b.height)}${mass ? ` · Σmass ${Number(mass.toPrecision(3))}` : ""}`
    },
    stepDiff(index) { //what a history step changed, for its tooltip
        const steps = levelEditor.history.steps
        if (index === 0 || !steps[index - 1]) return "the level as it was opened"
        const before = JSON.parse(steps[index - 1].json)
        const after = JSON.parse(steps[index].json)
        const short = value => {
            const text = Array.isArray(value) ? `[${value.length}]` : JSON.stringify(value)
            return text === undefined ? "-" : text.length > 24 ? text.slice(0, 23) + "…" : text
        }
        const lines = []
        for (const key of Object.keys({ ...before, ...after })) { //level properties
            if (key === "elements" || key === "nextId") continue
            if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) lines.push(`level.${key} ${short(before[key])} → ${short(after[key])}`)
        }
        const old = new Map(before.elements.map(el => [el.id, el]))
        const now = new Map(after.elements.map(el => [el.id, el]))
        for (const [id, el] of now) {
            const was = old.get(id)
            if (!was) {
                lines.push(`+ ${levelElements.nameOf(el.type)} #${id}`)
                continue
            }
            for (const key of Object.keys({ ...was, ...el })) {
                if (JSON.stringify(was[key]) !== JSON.stringify(el[key])) lines.push(`#${id}.${key} ${short(was[key])} → ${short(el[key])}`)
            }
        }
        for (const [id, el] of old) if (!now.has(id)) lines.push(`- ${levelElements.nameOf(el.type)} #${id}`)
        return lines.length > 12 ? lines.slice(0, 12).concat(`… ${lines.length - 12} more`).join("\n") : lines.join("\n") || "no change"
    },
    drawProblems() { //what the analysis found, outlined where it is, red to fix, orange to look at
        for (const [id, lines] of levelEditor.problems) {
            const el = levelData.find(levelEditor.data, id)
            if (!el || levelEditor.isHidden(el)) continue
            levelEditor.outline(el, lines.some(line => line.status === "fix") ? "#e00" : "#f80", 2, [8, 5])
        }
    },
    drawTip(point, lines) { //the analysis lines about the element under the mouse, above it on a light box
        ctx.font = `${levelEditor.px(12)}px monospace`
        ctx.textAlign = "left"
        ctx.textBaseline = "alphabetic"
        const texts = lines.map(line => `${line.status} ${line.label}${line.text ? `, ${line.text}` : ""}`)
        const x = point.x + levelEditor.px(14)
        let y = point.y - levelEditor.px(18) - levelEditor.px(16) * (texts.length - 1)
        const width = Math.max(...texts.map(text => ctx.measureText(text).width))
        ctx.fillStyle = "rgba(255,255,255,0.9)"
        ctx.fillRect(x - levelEditor.px(4), y - levelEditor.px(13), width + levelEditor.px(8), levelEditor.px(16) * texts.length + levelEditor.px(4))
        texts.forEach((text, i) => {
            ctx.fillStyle = lines[i].status === "fix" ? "#c00" : "#b60"
            ctx.fillText(text, x, y)
            y += levelEditor.px(16)
        })
    },
    drawGrid() {
        let step = levelEditor.grid
        while (step * simulation.zoom < 10) step *= 4 //lines at least 10 pixels apart
        const left = (0 - canvas.width2) / simulation.zoom + canvas.width2 - m.transX
        const top = (0 - canvas.height2) / simulation.zoom + canvas.height2 - m.transY
        const right = left + canvas.width / simulation.zoom
        const bottom = top + canvas.height / simulation.zoom
        ctx.beginPath()
        for (let x = Math.ceil(left / step) * step; x < right; x += step) {
            ctx.moveTo(x, top)
            ctx.lineTo(x, bottom)
        }
        for (let y = Math.ceil(top / step) * step; y < bottom; y += step) {
            ctx.moveTo(left, y)
            ctx.lineTo(right, y)
        }
        ctx.lineWidth = levelEditor.px(1)
        ctx.strokeStyle = levelEditor.colors.grid
        ctx.stroke()
        ctx.beginPath() //0, 0
        ctx.moveTo(0, top)
        ctx.lineTo(0, bottom)
        ctx.moveTo(left, 0)
        ctx.lineTo(right, 0)
        ctx.strokeStyle = levelEditor.colors.axis
        ctx.stroke()
    },
    drawGuides() { //each type's editor only drawing, like how far a platform travels
        ctx.lineWidth = levelEditor.px(1.5)
        ctx.strokeStyle = levelEditor.colors.guide
        ctx.setLineDash([levelEditor.px(6), levelEditor.px(6)])
        for (const el of levelEditor.data.elements) {
            const type = levelElements.types[el.type]
            if (type && type.overlay && !levelEditor.isHidden(el)) type.overlay(el)
        }
        ctx.setLineDash([])
    },
    outlinePoints(points, strokeStyle, width, fillStyle, isOpen = false) {
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
        if (!isOpen) ctx.closePath()
        ctx.fillStyle = fillStyle
        ctx.fill()
        ctx.lineWidth = levelEditor.px(width)
        ctx.strokeStyle = strokeStyle
        ctx.stroke()
    },
    outline(el, strokeStyle, width, dash = [], fillStyle = "") {
        ctx.beginPath()
        if (el.type === "laser") {
            ctx.moveTo(el.x, el.y)
            ctx.lineTo(el.x2, el.y2)
        } else {
            const points = levelElements.points(el)
            ctx.moveTo(points[0].x, points[0].y)
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
            if (!levelElements.isOpen(el)) ctx.closePath()
        }
        if (fillStyle) {
            ctx.fillStyle = fillStyle
            ctx.fill()
        }
        ctx.lineWidth = levelEditor.px(width)
        ctx.strokeStyle = strokeStyle
        ctx.setLineDash(dash.map(levelEditor.px))
        ctx.stroke()
        ctx.setLineDash([])
    },
    drawHandles(el) {
        const size = levelEditor.px(8)
        ctx.beginPath()
        for (const h of levelElements.handles(el)) ctx.rect(h.x - size / 2, h.y - size / 2, size, size)
        ctx.fillStyle = "#fff"
        ctx.fill()
        ctx.lineWidth = levelEditor.px(1.5)
        ctx.strokeStyle = levelEditor.colors.select
        ctx.stroke()
        const turn = levelEditor.rotateHandle(el)
        if (turn) { //round, on a short line from the top
            ctx.beginPath()
            ctx.moveTo(turn.x, turn.y + size / 2)
            ctx.lineTo(turn.x, turn.y + levelEditor.px(28))
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(turn.x, turn.y, size / 2 + levelEditor.px(1), 0, 2 * Math.PI)
            ctx.fill()
            ctx.stroke()
        }
    },
    drawDragRect(drag) {
        const isDraw = drag.kind === "draw"
        const rect = levelEditor.dragRect(drag, isDraw)
        ctx.fillStyle = isDraw ? (levelEditor.tool === "map" ? "rgba(68,68,68,0.5)" : "rgba(140,140,140,0.5)") : "rgba(0,170,255,0.08)"
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
        ctx.lineWidth = levelEditor.px(1.5)
        ctx.strokeStyle = levelEditor.colors.select
        ctx.setLineDash(isDraw ? [] : [levelEditor.px(5), levelEditor.px(5)])
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
        ctx.setLineDash([])
    },
    drawLabel(point) { //snapped position by the mouse, and the size of a rect being drawn
        const drag = levelEditor.drag
        let text
        if (drag && drag.kind === "draw") {
            const rect = levelEditor.dragRect(drag)
            text = `${rect.width} × ${rect.height}`
        } else if (drag && drag.kind === "vertex") {
            const p = levelEditor.snapPoint(point)
            text = `${levelEditor.formatValue(p.x)}, ${levelEditor.formatValue(p.y)}`
        } else if (drag && drag.kind === "handle" && drag.handle === "rotate") {
            text = `${levelEditor.dragTurn(drag)}°`
        } else if (drag && (drag.kind === "move" || drag.kind === "handle")) {
            const el = levelEditor.dragPreview(drag)[0]
            const f = levelEditor.formatValue
            const p = levelEditor.snapPoint(point)
            text = el.width !== undefined && !el.vertices ? `${f(el.x)}, ${f(el.y)}  ${f(el.width)} × ${f(el.height)}` : drag.kind === "handle" ? `${f(p.x)}, ${f(p.y)}` : `${f(el.x)}, ${f(el.y)}`
        } else { //where the mouse is shows in the status bar
            return
        }
        ctx.font = `${levelEditor.px(12)}px monospace`
        ctx.textAlign = "left" //other drawing can leave it centered
        ctx.textBaseline = "alphabetic"
        ctx.fillStyle = "rgba(0,0,0,0.7)"
        ctx.fillText(text, point.x + levelEditor.px(14), point.y - levelEditor.px(10))
    },

    //*********************************************************************
    // panels, the left one has tools and menus, the right one shows what's selected
    // add a menu to the left panel by adding to levelEditor.sections
    //*********************************************************************
    sections: [ //{ id, title, isClosed, render() }, without a title it's always shown, with one it can be folded, isClosed starts it folded
        {
            id: "top",
            render: () => `<div class="le-row">
                <span class="le-info" data-level-info>${levelEditor.infoText()}</span>
                <span class="le-fill"></span>${levelEditor.button("exit", "exit")}
            </div>`,
        },
        {
            id: "simulation",
            title: "simulation",
            render: () => `<div class="le-grid le-two le-run">${levelEditor.button("test", levelEditor.isTesting ? "■ stop test" : "▶ test", "", levelEditor.isTesting)}${levelEditor.button("fullTest", levelEditor.isFullTest ? "■ stop full test" : "▶ full test", "", levelEditor.isFullTest)}</div>
            <div class="le-row">
                <label class="le-label le-check" title="mobs and power ups spawn while testing"><input type="checkbox" data-setting="testSpawning"${levelEditor.isTestSpawning ? " checked" : ""}>mobs, power ups, from level</label>
                <input class="le-number le-short" data-setting="testLevel" value="${levelEditor.testLevel}" spellcheck="false" title="levels cleared while editing, for mob types and difficulty">
            </div>
            <div class="le-row"><span class="le-label">time</span><span class="le-segment">${[0.1, 0.25, 0.5, 1].map(scale => levelEditor.button("timeScale", `${scale}×`, scale, levelEditor.timeScale === scale, "game speed, it lowers the frame cap")).join("")}</span></div>
            <div class="le-label le-add-header">draw</div>
            <div class="le-grid">${levelEditor.debugLayers.map(([name, tip]) => levelEditor.button("debugDraw", name, name, levelEditor.debugDraw.has(name), tip)).join("")}</div>
            <div class="le-label le-add-header">readout</div>
            <pre class="le-readout" data-readout>${levelEditor.readoutText()}</pre>`,
        },
        {
            id: "explorer",
            title: "explorer",
            isClosed: true,
            render: () => `<div class="le-explorer" data-explorer>${levelEditor.explorerHtml()}</div>`,
        },
        {
            id: "add",
            title: "add",
            render: () => { //spots, a boss, and a 2nd boss are all a level needs for mobs, and starting, random, and debris for power ups, they show the power ups they can be
                const main = { startingPowerUps: ["gun", "tech", "ammo", "heal"], randomPowerUp: ["heal", "ammo"], debris: ["block", "heal", "ammo"] }
                return `<div class="le-label le-add-header">add level elements</div>
                    <div class="le-shapes">${levelElements.presets.map(preset => `<button class="le-button le-shape" data-command="preset" data-arg="${preset.name}" title="${preset.name}, as map, or block with the block tool">${levelElements.presetIcon(preset)}</button>`).join("")}</div>
                    <div class="le-grid">${levelEditor.addButtons("element")}</div>
                    <div class="le-label le-add-header">add mobs</div>
                    <div class="le-grid">${["mobSpot", "boss", "secondaryBoss"].map(name => levelEditor.addButton(name)).join("")}</div>
                    <div class="le-grid">${levelEditor.addButtons("mob", ["mobSpot", "boss", "secondaryBoss", "namedMob"])}</div>
                    <div class="le-row">${levelEditor.mobList()}</div>
                    <div class="le-label le-add-header">add power ups</div>
                    <div class="le-grid le-tall">${Object.entries(main).map(([name, orbs]) => levelEditor.addButton(name, `${levelElements.types[name].label}<br><span class="le-options">[${orbs.map(levelEditor.orb).join("")}]</span>`)).join("")}</div>
                    <div class="le-grid">${levelEditor.presetButtons("powerUp", name => `<span class="le-split"><span>${name}</span>${levelEditor.orb(name)}</span>`)}${levelEditor.addButtons("powerUp", ["powerUp", ...Object.keys(main)])}</div>
                    <div class="le-label le-add-header">add code</div>
                    <div class="le-grid le-one">${levelEditor.button("addCode", "+ code")}</div>`
            },
        },
        {
            id: "load",
            title: "export/import",
            render: () => `<div class="le-load" data-load-local></div>
                <div class="le-grid le-two le-gap-above">${levelEditor.button("newLevel", "new")}${levelEditor.button("importLevel", "import")}${levelEditor.button("pool", levelEditor.isInPool() ? "in level pool" : "add to level pool", "", levelEditor.isInPool())}${levelEditor.button("code", "export")}</div>
                <div class="le-load" data-load-written></div>`, //the local levels, then new, import, the pool, and export, then the written levels, filled in when it opens, see renderLoadList()
        },
    ],
    openPanel(name, text, html, mode = "") { //the code panel in the middle of the screen, html shows instead of the text when there is some, copy always copies the text, mode "import" is a box to paste into, "code" edits a code element
        const panel = document.getElementById("level-editor-code")
        const textarea = panel.querySelector("textarea")
        const report = panel.querySelector(".le-report")
        textarea.value = text
        textarea.hidden = !!html
        const isImport = mode === "import"
        const isEditable = isImport || mode === "code"
        textarea.readOnly = !isEditable
        textarea.placeholder = isImport ? "paste a level's javascript, like export JS writes" : ""
        report.hidden = !html
        report.innerHTML = html || ""
        panel.querySelector("[data-code-name]").textContent = name
        panel.querySelector('[data-command="copyPanel"]').hidden = isEditable
        panel.querySelector('[data-command="importText"]').hidden = !isImport
        panel.querySelector('[data-command="applyCode"]').hidden = mode !== "code"
        panel.classList.add("le-open")
        if (isEditable) {
            textarea.focus()
            textarea.setSelectionRange(0, 0) //from the top
            textarea.scrollTop = 0
        }
    },
    copy(text, name) {
        navigator.clipboard.writeText(text).then(() => simulation.inGameConsole(`<em>//copied ${levelEditor.escape(name)}</em>`), () => simulation.inGameConsole(`<em>//copy failed</em>`))
    },
    keyCap(command) { //a command's first key, styled like the keys in the pause menu
        return `<span class="pause-hint le-key-cap"><strong class="key-input-train">${levelEditor.keyText(levelEditor.commands[command].keys[0])}</strong></span>`
    },
    isInPool() {
        return !!localSettings.levelPool && localSettings.levelPool.added.includes(levelEditor.data.name)
    },
    addButtons(group, skip = []) { //a button for each type in a group, and one for each of its named presets
        return levelElements.groups[group].filter(name => !skip.includes(name)).map(name => levelEditor.addButton(name) + levelEditor.presetButtons(name)).join("")
    },
    addButton(name, text) { //its tooltip is the type's tip
        const type = levelElements.types[name]
        const command = type.addCommand || "add"
        const isOn = command === "drawPath" && !!levelEditor.pathDraw
        return levelEditor.button(command, text || type.label, name, isOn, type.tip || `add ${type.label}`)
    },
    presetButtons(name, text = preset => preset) { //a button for each of the type's names, text(preset) is what the button shows
        const type = levelElements.types[name]
        return (type.names || []).map(preset => levelEditor.button("add", text(preset), `${name}:${preset}`, false, (type.tips && type.tips[preset]) || `add ${preset}`)).join("")
    },
    orb(name) { //the power up's orb from powerUps.orb, without the game's hover help, "block" is a little block, difficulty has no orb so it's a black circle like in the level
        if (name === "block") return `<span class="le-orb"><span class="le-block-icon"></span></span>`
        if (name === "difficulty") return `<span class="le-orb"><span class="le-difficulty-icon"></span></span>`
        return powerUps.orb[name] ? `<span class="le-orb">${powerUps.orb[name]().replace(/ data-help="[^"]*"/g, "")}</span>` : ""
    },
    mobList() { //every mob and boss by tier, picking one adds it
        const tiers = spawn.tier.map((names, i) => [`tier ${i}`, names]).concat(spawn.bossTier.map((names, i) => [`tier ${i} bosses`, names])).filter(([, names]) => names.length)
        return `<select class="le-mob-list" data-add="namedMob" title="${levelEditor.escape(levelElements.types.namedMob.tip)}">
            <option value="">mob by name</option>
            ${tiers.map(([label, names]) => `<optgroup label="${label}">${names.map(name => `<option>${name}</option>`).join("")}</optgroup>`).join("")}
        </select>`
    },
    openSections() { //which sections are folded, remembered for next time
        try {
            return JSON.parse(localStorage.getItem("levelEditorSections")) || {}
        } catch (error) {
            return {}
        }
    },
    escape(text) {
        return String(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    },
    button(command, text, arg = "", isOn = false, title = levelEditor.tip(command)) {
        return `<button class="le-button${isOn ? " le-on" : ""}" data-command="${command}" data-arg="${levelEditor.escape(arg)}" title="${levelEditor.escape(title)}">${text}</button>`
    },
    renderLeft() {
        const open = levelEditor.openSections()
        document.getElementById("level-editor-left").innerHTML = levelEditor.sections.map(section => section.title ?
            `<details class="le-section" data-section="${section.id}"${open[section.id] ?? !section.isClosed ? " open" : ""}><summary>${section.title}</summary><div class="le-details">${section.render()}</div></details>` :
            `<div class="le-section">${section.render()}</div>`).join("")
        levelEditor.updateHistoryButtons()
        if (document.querySelector('#level-editor-left [data-section="load"]').open) levelEditor.renderLoadList()
        levelEditor.renderStatus()
    },
    renderStatus() { //the bar along the bottom, like VS Code's: the mouse, grid, zoom, saving, and what the analysis found
        document.getElementById("level-editor-status").innerHTML = `<span class="le-status-item le-status-where">
                <span class="le-status-mouse" data-status-mouse title="where the mouse is, snapped to the grid"></span>
                <span class="le-status-selection" data-status-selection title="what's selected, its bounds, and the mass of its bodies"></span>
            </span>
            <span class="le-status-item"><span class="le-label">grid</span><input class="le-number" data-setting="grid" value="${levelEditor.grid}" spellcheck="false" title="snap size, hold alt to place freely">${levelEditor.button("grid", "lines", "", levelEditor.isGridShown)}</span>
            <span class="le-status-item"><span class="le-label">zoom</span><input class="le-number" data-setting="zoom" value="${Math.round(levelEditor.zoomScale)}" spellcheck="false" title="the editor's zoom, the wheel zooms too">${levelEditor.button("matchZoom", "match level")}</span>
            <span class="le-status-item"><span class="le-label">draw</span><span class="le-segment">${levelEditor.tools.map(tool => levelEditor.button("tool", tool, tool, levelEditor.tool === tool)).join("")}</span>${levelEditor.keyCap("tool")}</span>
            <span class="le-status-item">
                <span class="le-status-saved" data-status-saved></span>
                <button class="le-button le-status-problems${levelEditor.problemIsFix ? " le-status-fix" : ""}" data-command="analyze" data-status-problems title="${levelEditor.escape(levelEditor.tip("analyze"))}">${levelEditor.problemText}</button>
            </span>
            <span class="le-status-item le-segment le-history-box">${levelEditor.button("undo", "undo")}${levelEditor.button("redo", "redo")}${levelEditor.button("history", "history ▴", "", levelEditor.isHistoryOpen)}</span>`
        levelEditor.statusMouse = ""
        levelEditor.updateHistoryButtons()
        levelEditor.updateSelectionStatus()
        levelEditor.updateSaved()
        levelEditor.countProblems(0)
    },
    creation(command, arg, at) { //what an add button makes, its middle at at, snapped, or in the middle of the view, for clicking and dragging onto the level
        const center = levelEditor.snapPoint(at || levelEditor.viewCenter())
        if (command === "preset") {
            const preset = levelElements.presets.find(p => p.name === arg)
            if (!preset) return null
            const typeName = levelEditor.tool === "block" ? "block" : "map"
            const [w, h] = preset.size
            const x = levelEditor.snap(center.x - w / 2)
            const y = levelEditor.snap(center.y - h / 2)
            const elements = preset.rects ?
                preset.rects(w, h).map(([rx, ry, rw, rh]) => levelElements.create(typeName, { x: x + rx, y: y + ry, width: rw, height: rh })) :
                [levelElements.create(typeName)]
            if (!preset.rects) levelElements.setPoints(elements[0], preset.points(w, h).map(([px, py]) => ({ x: x + px, y: y + py })))
            return { elements, label: `add ${arg} ` }
        }
        const [typeName, preset] = arg.split(":")
        const type = levelElements.types[typeName]
        if (!type) return null
        const values = preset && type.preset ? type.preset(preset, levelEditor.data) : {}
        const el = levelElements.create(typeName, values)
        if (at || values.x === undefined || values.y === undefined) { //clicking a preset with a place leaves it there, like the exit fill around the exit
            const b = levelElements.bounds(el)
            levelElements.move(el, center.x - levelEditor.snap(b.x + b.width / 2), center.y - levelEditor.snap(b.y + b.height / 2), true)
        }
        return { elements: [el], label: `add ${preset ? `${preset} ` : ""}` }
    },
    fixSpot(typeName) { //where an analysis fix puts what it adds: on top of a map piece, as far from the enter as written levels keep it, and apart from others like it
        const data = levelEditor.data
        const context = levelAnalysis.context(data, {})
        const norms = levelAnalysis.norms
        const tops = data.elements.filter(el => el.type === "map").map(el => levelElements.bounds(el)).filter(b => b.width > 60)
        if (!tops.length) return null
        const isBoss = typeName === "boss" || typeName === "secondaryBoss"
        const lift = isBoss ? 100 : typeName === "mobSpot" ? 60 : 40 //above the ground by about its size
        const fromEnter = norms.near[typeName] || (levelElements.types[typeName]?.group === "mob" ? norms.near.mob : 300)
        const apart = isBoss ? norms.bossApart : 300
        const others = data.elements.filter(el => el.type === typeName || (isBoss && (el.type === "boss" || el.type === "secondaryBoss")))
        const total = tops.reduce((sum, b) => sum + b.width, 0)
        let best = null
        let bestScore = -1
        for (let i = 0; i < 300; i++) { //random spots along the tops of the map, wider pieces get more, the best one that isn't in the map wins
            let r = Math.random() * total
            const b = tops.find(top => (r -= top.width) < 0) || tops[0]
            const point = { x: Math.round(b.x + 30 + Math.random() * (b.width - 60)), y: b.y - lift }
            if (levelAnalysis.inMap(context, point)) continue
            const enter = context.spawn ? Math.hypot(point.x - context.spawn.x, point.y - context.spawn.y) / fromEnter : 1
            const near = others.length ? Math.min(...others.map(el => Math.hypot(point.x - el.x, point.y - el.y))) / apart : 1
            const score = Math.min(enter, near, 1) + 0.001 * Math.random() //far enough is enough, then any spot that is
            if (score > bestScore) {
                best = point
                bestScore = score
            }
        }
        return best
    },
    place(made) { //adds what creation() made as one undo step and selects it
        if (!made) return
        for (const el of made.elements) levelEditor.unstack(el, made.elements)
        const ids = []
        levelEditor.edit(`${made.label}${levelEditor.describe(made.elements)}`, data => {
            for (const el of made.elements) ids.push(levelData.add(data, el).id)
            return ids
        })
        levelEditor.select(ids)
    },
    toggleView(types, ids, arg) { //the explorer's hide and lock, returns the ids it changed
        const [kind, key] = String(arg).split(":")
        const value = kind === "type" ? key : Number(key)
        const set = kind === "type" ? types : ids
        if (set.has(value)) set.delete(value)
        else set.add(value)
        levelEditor.renderExplorer()
        return levelEditor.data.elements.filter(el => kind === "type" ? el.type === key : el.id === value).map(el => el.id)
    },
    explorerHtml() { //every element by type, each type folds, with hide and lock for the type and each element
        const data = levelEditor.data
        if (!data) return ""
        const open = levelEditor.openSections()
        const types = [...new Set([...levelElements.buildOrder.flatMap(group => levelElements.groups[group]), ...data.elements.map(el => el.type)])]
        return types.map(typeName => {
            const list = data.elements.filter(el => el.type === typeName)
            if (!list.length) return ""
            const type = levelElements.types[typeName]
            const label = type ? type.label : typeName
            const canHide = levelEditor.isHideable(list[0])
            const toggles = (arg, isHidden, isLocked) => `${canHide ? levelEditor.button("hide", "hide", arg, isHidden) : ""}${levelEditor.button("lock", "lock", arg, isLocked)}`
            const shown = list.slice(0, 100) //a big level's maps would be a long list, the rest are picked in the level
            const rows = shown.map(el => `<div class="le-explore-row${levelEditor.selection.includes(el.id) ? " le-selected" : ""}">
                <button class="le-button le-explore-name" data-command="jumpTo" data-arg="${el.id}" title="select it and go to it">${levelEditor.escape(type && type.isCode ? levelElements.codeTitle(el) : levelElements.summary(el))} <span class="le-id">#${el.id}</span></button>${toggles(`id:${el.id}`, levelEditor.hiddenIds.has(el.id), levelEditor.lockedIds.has(el.id))}</div>`).join("")
            const more = list.length > shown.length ? `<div class="le-comment">//${list.length - shown.length} more, click them in the level</div>` : ""
            return `<details class="le-explore-group" data-section="explore-${typeName}"${open[`explore-${typeName}`] ? " open" : ""}><summary><span class="le-explore-type">${levelEditor.escape(label)} <span class="le-id">${list.length}</span></span>${toggles(`type:${typeName}`, levelEditor.hiddenTypes.has(typeName), levelEditor.lockedTypes.has(typeName))}</summary>${rows}${more}</details>`
        }).join("")
    },
    renderExplorer() { //after changes and selecting, only while it's open
        const box = document.querySelector("#level-editor-left [data-explorer]")
        if (!box || !box.closest("details").open) return
        box.innerHTML = levelEditor.explorerHtml()
    },
    updatePanels() { //tab and full test hide the panels, a hint says how to get them back
        document.body.classList.toggle("le-panels-hidden", levelEditor.isActive && levelEditor.isPanelsHidden)
        const hint = document.getElementById("level-editor-hint")
        if (hint) hint.textContent = `${levelEditor.isFullTest ? "full test, " : ""}tab shows the editor`
    },
    updateStatusMouse(point) { //each frame, only touches the page when it changes
        const p = levelEditor.snapPoint(point)
        const text = levelEditor.isMouseOnCanvas ? `${levelEditor.formatValue(p.x)}, ${levelEditor.formatValue(p.y)}` : ""
        if (text === levelEditor.statusMouse) return
        levelEditor.statusMouse = text
        const span = document.querySelector("#level-editor-status [data-status-mouse]")
        if (span) span.textContent = text
    },
    updateSaved() {
        const span = document.querySelector("#level-editor-status [data-status-saved]")
        if (span) span.textContent = levelEditor.saveTimer === null ? "saved" : "saving…"
    },
    countProblems(delay = 400) { //the analysis, a moment after changes stop, a big level's checks take a few milliseconds
        clearTimeout(levelEditor.problemTimer)
        levelEditor.problemTimer = setTimeout(() => {
            const button = document.querySelector("#level-editor-status [data-status-problems]")
            if (!button || !levelEditor.data) return
            const report = levelEditor.analysisReport = levelAnalysis.run(levelEditor.data, { isLive: true })
            const counts = levelAnalysis.counts(report)
            levelEditor.problems = new Map()
            for (const section of report.sections) {
                for (const line of section.lines) {
                    if (line.status !== "fix" && line.status !== "warn") continue
                    for (const id of line.ids || []) {
                        if (!levelEditor.problems.has(id)) levelEditor.problems.set(id, [])
                        levelEditor.problems.get(id).push(line)
                    }
                }
            }
            const parts = [counts.fix && `${counts.fix} fix`, counts.warn && `${counts.warn} warn`].filter(Boolean)
            button.textContent = levelEditor.problemText = parts.length ? parts.join(" · ") : "✓ ready" //kept, so redrawing the bar doesn't blank it
            levelEditor.problemIsFix = !!counts.fix
            button.classList.toggle("le-status-fix", levelEditor.problemIsFix)
            if (levelEditor.isAnalysisShown) levelEditor.renderRight() //it's up to date as the level changes
        }, delay)
    },
    infoText() { //the top of the left panel, which level this is
        const count = levelEditor.data.elements.length
        return `<span class="le-name">${levelEditor.escape(levelEditor.data.name)}</span> <span class="le-id">${count} element${count === 1 ? "" : "s"}</span>`
    },
    updateHistoryButtons() {
        const info = document.querySelector("#level-editor-left [data-level-info]")
        if (info) info.innerHTML = levelEditor.infoText() //after any change, and renaming
        const history = levelEditor.history
        const undo = document.querySelector(`#level-editor-status [data-command="undo"]`)
        const redo = document.querySelector(`#level-editor-status [data-command="redo"]`)
        if (undo) undo.disabled = history.index === 0
        if (redo) redo.disabled = history.index === history.steps.length - 1
        const list = document.querySelector("#level-editor-history [data-history]")
        if (list && levelEditor.isHistoryOpen) {
            const scroll = list.scrollTop
            list.innerHTML = levelEditor.historyList()
            list.scrollTop = scroll
        }
    },
    historyList() { //newest at the top, undone steps are grey and can be redone
        const history = levelEditor.history
        return history.steps.map((step, i) => `<button class="le-button le-step${i === history.index ? " le-on" : ""}${i > history.index ? " le-undone" : ""}" data-command="rewind" data-arg="${i}" title="${levelEditor.escape(step.label)}">${levelEditor.escape(step.label)}</button>`).reverse().join("")
    },
    storageText() { //how much of localStorage is used, it's shared with settings and checkpoints
        const used = levelData.store.used()
        const quota = levelData.store.quota
        const size = n => n < 100000 ? `${Math.ceil(n / 1000)} kB` : `${Number((n / 1000000).toFixed(1))} MB`
        return `<span class="le-storage${used > 0.8 * quota ? " le-storage-full" : ""}" title="saved in your browser, shared with settings and checkpoints">${size(used)} of ${size(quota)} used</span>`
    },
    renderLoadList() {
        const current = levelEditor.data.name
        const open = levelEditor.openSections()
        const group = (title, items, note = "") => items.length ? `<div class="le-label le-load-header">${title}${note}</div><div class="le-load-pairs">${items.join("")}</div>` : "" //local levels, each with its delete button, apart so the × is clearly its own
        const titled = (title, items) => items.length ? `<div class="le-label le-load-header">${title}</div><div class="le-grid le-load-grid">${items.join("")}</div>` : ""
        levelEditor.flush() //so the level being edited counts
        const written = (source, names) => names.map(name => levelEditor.button("load", name, `${source}:${name}`))
        const hidden = ["template", "testing", "null"]
        document.querySelector("#level-editor-left [data-load-local]").innerHTML =
            group("local", levelData.store.names().map(name => `<span class="le-pair">${levelEditor.button("load", name, `local:${name}`, name === current)}${levelEditor.button("deleteLevel", "×", name)}</span>`), levelEditor.storageText())
        document.querySelector("#level-editor-left [data-load-written]").innerHTML =
            `<details class="le-load-group" data-section="load-written"${open["load-written"] ? " open" : ""}><summary>more levels</summary>${ //written levels fold away
                titled("n-gon", written("written", Object.keys(level.maps).filter(name => !hidden.includes(name)))) +
                titled("community", written("more", level.communityLevels)) +
                titled("training", written("more", level.trainingLevels)) +
                titled("other", written("written", ["testing"])) //the level.maps.testing sandbox
            }</details>`
    },

    //*********************************************************************
    // inspector, the right panel, the selected element's properties written like code
    //*********************************************************************
    renderRight() {
        const elements = levelEditor.selected()
        const panel = document.getElementById("level-editor-right")
        if (levelEditor.isAnalysisShown) {
            panel.innerHTML = levelEditor.inspectAnalysis()
        } else if (elements.length === 1) {
            panel.innerHTML = levelEditor.inspectElement(elements[0])
        } else if (elements.length > 1) {
            panel.innerHTML = levelEditor.inspectMany(elements)
        } else {
            panel.innerHTML = levelEditor.inspectLevel()
        }
        levelEditor.inspected = levelEditor.isAnalysisShown ? "analysis" : elements.map(el => `${el.id}:${el.type}`).join()
        levelEditor.renderExplorer()
        levelEditor.updateSelectionStatus()
    },
    refreshRight() { //redraws, or while a field has focus only updates the values, so typing and arrow keys aren't interrupted
        const elements = levelEditor.selected()
        const panel = document.getElementById("level-editor-right")
        if (elements.map(el => `${el.id}:${el.type}`).join() !== levelEditor.inspected || !panel.contains(document.activeElement)) return levelEditor.renderRight()
        levelEditor.refreshFields(panel)
    },
    refreshFields(root = document.getElementById("level-editor-right")) { //new values in the fields, except the one being typed in, the level properties are in the inspector with nothing selected
        for (const input of root.querySelectorAll("[data-key]")) {
            if (input === document.activeElement || input.dataset.owner === "many") continue
            const owner = levelEditor.ownerOf(input)
            const prop = owner && levelEditor.findProp(input.dataset.key, owner)
            if (!prop) continue
            const value = levelEditor.propValue(owner, prop)
            if (input.type === "checkbox") {
                input.checked = !!value
            } else {
                input.value = levelEditor.formatValue(value)
                if (input.matches(".le-value")) input.style.width = levelEditor.fieldWidth(input.value)
            }
            const swatch = input.parentElement.querySelector("[data-swatch]")
            if (swatch) swatch.value = levelEditor.hexColor(value)
        }
    },
    ownerOf(input) { //the level for level property fields, or the selected element
        if (input.dataset.owner === "level") return levelEditor.data
        const elements = levelEditor.selected()
        return elements.length === 1 ? elements[0] : null
    },
    propsOf(owner) {
        return owner === levelEditor.data ? levelElements.level.props : levelElements.types[owner.type]?.props || []
    },
    findProp(key, owner) {
        return owner ? levelEditor.propsOf(owner).find(prop => prop.key === key) : null
    },
    hexColor(value) { //for a color picker, which only takes #rrggbb
        const context = levelEditor.colorContext || (levelEditor.colorContext = document.createElement("canvas").getContext("2d"))
        context.fillStyle = "#000"
        context.fillStyle = String(value)
        const style = context.fillStyle
        if (style.startsWith("#")) return style
        const rgb = style.match(/\d+/g) || [0, 0, 0]
        return "#" + rgb.slice(0, 3).map(n => Number(n).toString(16).padStart(2, "0")).join("")
    },
    pickedColor(hex, old) { //the picker only does #rrggbb, so a see-through color like a shadow keeps its alpha
        const alpha = String(old).startsWith("rgba") ? Number((String(old).match(/[\d.]+/g) || [])[3]) : 1
        if (!(alpha < 1)) return hex
        const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
        return `rgba(${r},${g},${b},${alpha})`
    },
    previewColor(input, hex) { //shows a color while the picker is open, without an undo step, endPreview() puts the old one back before setProp() saves it
        const owners = input.dataset.owner === "many" ? levelEditor.selected() : [levelEditor.ownerOf(input)].filter(Boolean)
        const key = input.dataset.key
        if (!owners.length) return
        const preview = levelEditor.preview
        if (!preview || preview.key !== key || preview.owners.length !== owners.length || preview.owners.some((owner, i) => owner !== owners[i])) levelEditor.preview = { owners, key, values: owners.map(owner => owner[key]) }
        input.value = levelEditor.pickedColor(hex, levelEditor.preview.values[0])
        for (const owner of owners) owner[key] = input.value
        levelEditor.applyPreview(owners)
    },
    endPreview() {
        const preview = levelEditor.preview
        if (!preview) return
        levelEditor.preview = null
        preview.owners.forEach((owner, i) => { owner[preview.key] = preview.values[i] })
        levelEditor.applyPreview(preview.owners.filter(owner => owner === levelEditor.data || levelData.find(levelEditor.data, owner.id)))
    },
    applyPreview(owners) {
        if (levelEditor.isFullTest) return //the color shows once editing goes back to elements
        if (owners[0] === levelEditor.data) return levelData.applySettings(levelEditor.data)
        levelData.rebuild(owners.map(owner => owner.id))
    },
    propValue(owner, prop) {
        return prop.read ? prop.read(owner) : owner[prop.key]
    },
    codeValue(value) { //a value written like code, for history labels
        return typeof value === "string" ? `"${value}"` : levelEditor.formatValue(value)
    },
    formatValue(value) {
        return typeof value === "number" ? String(Number(value.toFixed(6))) : String(value ?? "")
    },
    field(owner, prop) {
        const value = levelEditor.propValue(owner, prop)
        const key = `<span class="color-var">${prop.key}</span><span class="color-symbol">:</span>`
        const data = `data-key="${prop.key}"${owner === levelEditor.data ? ` data-owner="level"` : ""}`
        let input
        if (prop.kind === "bool") {
            input = `<input type="checkbox" ${data}${value ? " checked" : ""}>`
        } else if (prop.kind === "select") {
            input = `<select ${data}>${prop.options.map(option => `<option${option === value ? " selected" : ""}>${option}</option>`).join("")}</select>`
        } else if (prop.kind === "ref") { //another element by id, from a list or picked by clicking it
            const options = levelEditor.data.elements.filter(other => levelElements.isRefTo(owner, prop.key, other))
            input = `<select ${data}><option value="">null</option>${options.map(other => `<option value="${other.id}"${other.id === value ? " selected" : ""} title="${levelEditor.escape(levelElements.summary(other))}">${other.type} #${other.id}</option>`).join("")}</select>${levelEditor.button("pick", "pick", prop.key, levelEditor.picking && levelEditor.picking.key === prop.key)}`
        } else {
            const isText = prop.kind === "text" || prop.kind === "color"
            const text = levelEditor.formatValue(value)
            input = `${isText ? `<span class="le-quote">"</span>` : ""}<input class="le-value${isText ? " le-text" : ""}" ${data} value="${levelEditor.escape(text)}" style="width: ${levelEditor.fieldWidth(text)}" spellcheck="false" autocomplete="off">${isText ? `<span class="le-quote">"</span>` : ""}`
            if (prop.kind === "color") input = `<input type="color" class="le-swatch" data-swatch value="${levelEditor.hexColor(value)}" title="pick a color">${input}`
        }
        return `<div class="le-prop">${key} ${input}<span class="color-symbol">,</span></div>`
    },
    fieldWidth(text) { //as wide as its text, it's monospace
        return `${Math.min(26, Math.max(2, String(text).length + 0.5))}ch`
    },
    inspectCode(el) { //the code, click it or edit to change it in the code panel
        const runtime = levelData.runtimes.get(el.id)
        return `<div class="le-row"><span class="le-name">code</span><span class="le-id">#${el.id}</span></div>
            <pre class="le-code-view" data-command="editCode" title="edit the code">${levelEditor.escape(el.code) || " "}</pre>
            ${runtime && runtime.error ? `<div class="le-error">//${levelEditor.escape(runtime.error.message)}</div>` : ""}
            <div class="le-row">${levelEditor.button("editCode", "edit code")}<span class="le-fill"></span>${levelEditor.button("delete", "delete")}</div>`
    },
    inspectElement(el) {
        const type = levelElements.types[el.type]
        if (type && type.isCode) return levelEditor.inspectCode(el)
        const runtime = levelData.runtimes.get(el.id)
        const isShape = levelElements.groups.shape.includes(el.type)
        const isVertexEditable = levelElements.isVertexEditable(el)
        const shapes = isShape ? `<span class="le-segment">${levelElements.groups.shape.map(name => levelEditor.button("shape", name, name, el.type === name)).join("")}</span>` : ""
        const props = type ? type.props : []
        const isVertexMode = levelEditor.vertexElement() === el
        const isJs = levelEditor.inspectMode === "js"
        const modes = `<span class="le-segment">${levelEditor.button("inspectMode", "{ }", "props", !isJs)}${levelEditor.button("inspectMode", "js", "js", isJs)}</span>`
        return `<div class="le-row"><span class="le-name">${levelElements.nameOf(el.type)}</span><span class="le-id">#${el.id}</span><span class="le-fill"></span>${shapes}${modes}</div>
            ${isJs ? `<pre class="le-js-view">${levelEditor.escape(levelData.elementCode(levelEditor.data, el))}</pre>` : `<div class="le-code"><span class="color-symbol">{</span>
                ${props.map(prop => levelEditor.field(el, prop)).join("")}
                ${isVertexMode ? levelEditor.inspectVertices(el) : el.vertices ? `<div class="le-prop"><span class="color-var">vertices</span><span class="color-symbol">:</span> <span class="le-comment">[${el.vertices.length}]</span><span class="color-symbol">,</span></div>` : ""}
            <span class="color-symbol">}</span></div>
            ${levelEditor.physicsText(el)}`}
            ${Array.isArray(el.spots) ? levelEditor.inspectSpots(el) : ""}
            ${levelElements.isLinkSource(el) ? levelEditor.inspectLinks(el) : ""}
            ${levelEditor.picking ? `<div class="le-comment">//click ${levelEditor.picking.isLink ? "a door or element to link" : `the ${levelEditor.picking.key}`}, esc stops</div>` : ""}
            ${isVertexMode && levelEditor.vertex.error ? `<div class="le-error">//${levelEditor.escape(levelEditor.vertex.error)}</div>` : ""}
            ${!type ? `<div class="le-comment">//unknown type</div>` : ""}
            ${runtime && runtime.error ? `<div class="le-error">//${levelEditor.escape(runtime.error.message)}</div>` : ""}
            ${levelElements.isRotatable(el) ? levelEditor.rotateRow() : ""}
            <div class="le-row">
                ${isVertexEditable ? levelEditor.button("vertices", "vertices", "", isVertexMode) : ""}
                ${el.type === "block" ? levelEditor.button("constrain", "constraint") : ""}
                <span class="le-fill"></span>
                ${type && type.isSingleton ? "" : `<span class="le-segment">${levelEditor.button("duplicate", "duplicate")}${levelEditor.button("delete", "delete")}</span>`}
            </div>`
    },
    inspectLinks(el) { //what this button or toggle turns on and off, written like a list
        const linked = levelEditor.data.elements.filter(other => other.link === el.id)
        const free = levelEditor.data.elements.filter(other => !linked.includes(other) && levelElements.isRefTo(other, "link", el))
        return `<div class="le-row le-spots"><span class="color-var">links</span><span class="color-symbol">:</span>
                <span class="le-fill"></span>${levelEditor.button("pickLink", "link", "", levelEditor.picking && levelEditor.picking.isLink)}</div>
            ${linked.map(other => `<div class="le-prop">${levelEditor.escape(levelElements.summary(other))} <span class="le-id">#${other.id}</span> ${levelEditor.button("unlink", "×", other.id)}</div>`).join("")}
            ${free.length ? `<div class="le-prop"><select class="le-link-list" data-link-to="${el.id}"><option value="">link…</option>${free.map(other => `<option value="${other.id}">${levelEditor.escape(levelElements.summary(other))} #${other.id}</option>`).join("")}</select></div>` : ""}`
    },
    inspectSpots(el) { //other places a boss could spawn
        return `<div class="le-row le-spots"><span class="color-var">spots</span><span class="le-fill"></span>${levelEditor.button("addSpot", "+ spot")}</div>
            ${el.spots.map(([x, y], i) => `<div class="le-prop"><span class="le-comment">${i + 2}:</span> [${levelEditor.formatValue(x)}, ${levelEditor.formatValue(y)}] ${levelEditor.button("removeSpot", "×", i)}</div>`).join("")}`
    },
    inspectVertices(el) { //sides buttons for maps and blocks, and the vertices written like spawn.mapVertex to edit as text
        const count = levelElements.points(el).length
        const sides = levelElements.groups.shape.includes(el.type) ?
            `<span class="le-segment">${levelEditor.button("sides", "−", "-1")}<span class="le-count">${count}</span>${levelEditor.button("sides", "+", "1")}</span>` :
            `<span class="le-comment">[${count}]</span>`
        return `<div class="le-prop"><span class="color-var">vertices</span><span class="color-symbol">:</span> ${sides}</div>
            <div class="le-prop"><textarea class="le-path" data-vertices rows="3" spellcheck="false" title="x y pairs around the center, like spawn.mapVertex">${levelEditor.vertex.error ? levelEditor.escape(levelEditor.vertex.text) : levelElements.pathText(el)}</textarea></div>`
    },
    sharedProps(elements) { //props every selected element has, to change them all at once
        const first = levelElements.types[elements[0].type]?.props || []
        return first.filter(prop => prop.kind !== "ref" && elements.every(el => levelEditor.findProp(prop.key, el)?.kind === prop.kind))
    },
    manyValue(elements, prop) { //their value if they all match, or undefined
        const values = elements.map(el => levelEditor.propValue(el, levelEditor.findProp(prop.key, el)))
        return values.every(value => value === values[0]) ? values[0] : undefined
    },
    fieldMany(elements, prop) { //like field(), for all of them, blank when they're different
        const value = levelEditor.manyValue(elements, prop)
        const isMixed = value === undefined
        const key = `<span class="color-var">${prop.key}</span><span class="color-symbol">:</span>`
        const data = `data-key="${prop.key}" data-owner="many"`
        let input
        if (prop.kind === "bool") {
            input = `<input type="checkbox" ${data}${value ? " checked" : ""}>`
        } else if (prop.kind === "select") {
            input = `<select ${data}>${isMixed ? `<option value="" selected></option>` : ""}${prop.options.map(option => `<option${option === value ? " selected" : ""}>${option}</option>`).join("")}</select>`
        } else {
            const isText = prop.kind === "text" || prop.kind === "color"
            const text = isMixed ? "" : levelEditor.formatValue(value)
            input = `${isText ? `<span class="le-quote">"</span>` : ""}<input class="le-value${isText ? " le-text" : ""}" ${data} value="${levelEditor.escape(text)}" placeholder="${isMixed ? "mixed" : ""}" style="width: ${levelEditor.fieldWidth(text || "mixed")}" spellcheck="false" autocomplete="off">${isText ? `<span class="le-quote">"</span>` : ""}`
            if (prop.kind === "color") input = `<input type="color" class="le-swatch" data-swatch value="${levelEditor.hexColor(isMixed ? "#000" : value)}" title="pick a color">${input}`
        }
        return `<div class="le-prop">${key} ${input}<span class="color-symbol">,</span></div>`
    },
    rotateRow() { //type any angle and press enter, or a quarter turn, or drag the round handle above it
        return `<div class="le-row"><input class="le-number" data-rotate placeholder="angle" title="degrees to rotate clockwise, negative turns counterclockwise, enter rotates" spellcheck="false">${levelEditor.button("rotate", "↻ 90°", 90)}</div>`
    },
    inspectMany(elements) {
        const counts = {}
        for (const el of elements) counts[el.type] = (counts[el.type] || 0) + 1
        const isShapes = elements.every(el => levelElements.groups.shape.includes(el.type))
        const props = levelEditor.sharedProps(elements)
        return `<div class="le-row"><span class="le-name">${elements.length} selected</span></div>
            <div class="le-comment">//${Object.keys(counts).map(type => `${counts[type]} ${levelElements.nameOf(type)}`).join(", ")}</div>
            ${props.length ? `<div class="le-code"><span class="color-symbol">{</span>${props.map(prop => levelEditor.fieldMany(elements, prop)).join("")}<span class="color-symbol">}</span></div>` : ""}
            ${elements.some(levelElements.isRotatable) ? levelEditor.rotateRow() : ""}
            <div class="le-row">
                ${isShapes ? `<span class="le-segment">${levelElements.groups.shape.map(name => levelEditor.button("shape", name, name)).join("")}</span>` : ""}
                <span class="le-fill"></span><span class="le-segment">${levelEditor.button("duplicate", "duplicate")}${levelEditor.button("delete", "delete")}</span>
            </div>`
    },
    inspectAnalysis() { //the analysis in the inspector, each line about elements goes to them when clicked
        const report = levelEditor.analysisReport || levelAnalysis.run(levelEditor.data, { isLive: true })
        const escape = levelEditor.escape
        const selected = new Set(levelEditor.selection)
        const lines = report.sections.map(section => `<div class="le-analysis-section">//${escape(section.title)}</div>` + section.lines.map(line => {
            const ids = line.ids || []
            const body = `<span class="le-analysis-status">${line.status}</span> <span class="le-analysis-label">${escape(line.label)}</span>${line.value ? ` <span class="le-analysis-value">${escape(line.value)}</span>` : ""}${line.text ? `<span class="le-analysis-text">${escape(line.text)}</span>` : ""}`
            const isCurrent = ids.some(id => selected.has(id))
            if (!ids.length && line.add && levelElements.types[line.add]) { //clicking adds what fixes it
                const label = levelElements.types[line.add].label
                return `<button class="le-analysis-line le-${line.status}" data-command="fixProblem" data-arg="${line.add}" title="add ${escape(label)} in the middle of the view">${body}<span class="le-analysis-add">+ ${escape(label)}</span></button>`
            }
            return ids.length ?
                `<button class="le-analysis-line le-${line.status}${isCurrent ? " le-current" : ""}" data-command="jumpProblem" data-arg="${ids.join(",")}" title="go to it${ids.length > 1 ? `, ${ids.length} of them, click again for the next` : ""}">${body}</button>` :
                `<div class="le-analysis-line le-${line.status}">${body}</div>`
        }).join("")).join("")
        return `<div class="le-row"><span class="le-name">issues</span><span class="le-fill"></span><span class="le-segment">${levelEditor.button("copyAnalysis", "copy")}${levelEditor.button("closeAnalysis", "×")}</span></div>
            <div class="le-comment">//${escape(levelAnalysis.headline(report))}</div>
            <div class="le-analysis">${lines}</div>`
    },
    inspectLevel() { //nothing selected, the level's properties and code
        const counts = {}
        for (const el of levelEditor.data.elements) counts[el.type] = (counts[el.type] || 0) + 1
        const code = levelEditor.data.elements.filter(el => levelElements.types[el.type]?.isCode)
        return `<div class="le-row"><span class="le-name">level</span><span class="le-fill"></span>${levelEditor.button("levelDefaults", "default")}</div>
            <div class="le-comment">//${Object.keys(counts).map(type => `${counts[type]} ${levelElements.nameOf(type)}`).join(", ")}</div>
            <div class="le-code"><span class="color-symbol">{</span>${levelElements.level.props.map(prop => levelEditor.field(levelEditor.data, prop)).join("")}<span class="color-symbol">}</span></div>
            <div class="le-row le-spots"><span class="color-var">code</span><span class="color-symbol">:</span><span class="le-fill"></span>${levelEditor.button("addCode", "+ code")}</div>
            ${code.length ? `<div class="le-code-list">${code.map(el => `<button class="le-button le-code-item" data-command="selectId" data-arg="${el.id}" title="${levelEditor.escape(el.code.slice(0, 400))}"><span class="le-id">#${el.id}</span> ${levelEditor.escape(levelElements.codeTitle(el))}</button>`).join("")}</div>` : ""}
            ${levelData.codeError ? `<div class="le-error">//${levelEditor.escape(levelData.codeError.message)}</div>` : ""}`
    },
    revertField(input) {
        if (input.matches && input.matches("[data-vertices]") && levelEditor.vertexElement()) {
            levelEditor.vertex.error = ""
            input.value = levelElements.pathText(levelEditor.vertexElement())
            return
        }
        if (!input.dataset || !input.dataset.key) return
        if (input.dataset.owner === "many") { //back to their shared value, or blank
            const elements = levelEditor.selected()
            const prop = elements.length && levelEditor.findProp(input.dataset.key, elements[0])
            const value = prop && levelEditor.manyValue(elements, prop)
            if (prop && input.type !== "checkbox") input.value = value === undefined ? "" : levelEditor.formatValue(value)
            return
        }
        const owner = levelEditor.ownerOf(input)
        const prop = levelEditor.findProp(input.dataset.key, owner)
        if (prop && input.type !== "checkbox") input.value = levelEditor.formatValue(levelEditor.propValue(owner, prop))
    },
    readValue(input, prop) { //{ value } from a field, or null if it isn't one
        if (prop.kind === "bool") return { value: input.checked }
        if (prop.kind === "ref") return { value: input.value === "" ? null : Number(input.value) }
        if (prop.kind === "number") {
            const value = Number(input.value)
            if (input.value.trim() === "" || !Number.isFinite(value)) return null
            return { value: prop.min !== undefined ? Math.max(prop.min, value) : value }
        }
        if (prop.kind === "select" && input.value === "") return null //mixed
        return { value: input.value }
    },
    setManyProp(input) { //one field for every selected element
        const key = input.dataset.key
        const elements = levelEditor.selected()
        const prop = elements.length && levelEditor.findProp(key, elements[0])
        const read = prop && levelEditor.readValue(input, prop)
        if (!read) return levelEditor.revertField(input)
        levelEditor.edit(`${levelEditor.describe(elements)}.${key} = ${levelEditor.codeValue(read.value)}`, () => {
            for (const el of elements) {
                const own = levelEditor.findProp(key, el)
                if (own.write) {
                    own.write(el, read.value)
                } else {
                    el[key] = read.value
                }
            }
            return elements.map(el => el.id)
        })
        levelEditor.refreshRight()
    },
    setProp(input) { //from a field, for the selected element, or the level for level property fields
        if (input.dataset.owner === "many") return levelEditor.setManyProp(input)
        const key = input.dataset.key
        const owner = levelEditor.ownerOf(input)
        const prop = levelEditor.findProp(key, owner)
        if (!prop) return
        const read = levelEditor.readValue(input, prop)
        if (!read) return levelEditor.revertField(input) //not a number, put the old value back
        const value = read.value
        if (owner === levelEditor.data) return levelEditor.setLevelProp(key, value)
        const el = owner
        levelEditor.edit(`${levelEditor.describe([el])}.${key} = ${levelEditor.codeValue(value)}`, () => {
            if (prop.write) {
                prop.write(el, value)
            } else {
                el[key] = value
            }
            return [el.id]
        })
        levelEditor.refreshRight()
    },
    setLevelProp(key, value) {
        const data = levelEditor.data
        if (key === "name") {
            if (value !== data.name && levelData.isNameFree(value)) {
                levelEditor.flush()
                levelData.store.rename(data.name, value)
                data.name = value
                level.levels = [value]
                levelEditor.renderRight()
                levelEditor.updateHistoryButtons() //the name at the top
            }
            return levelEditor.refreshFields()
        }
        levelEditor.edit(`level.${key} = ${levelEditor.codeValue(value)}`, () => {
            data[key] = value
            return []
        })
        levelEditor.applyLevelProps()
    },
    stepProp(input, direction) { //arrow keys in a number field
        const prop = levelEditor.findProp(input.dataset.key, input.dataset.owner === "many" ? levelEditor.selected()[0] : levelEditor.ownerOf(input))
        if (!prop || prop.kind !== "number") return
        const step = (prop.isGrid ? Math.max(1, levelEditor.grid) : prop.step || 1) * direction
        const value = Number(input.value)
        input.value = levelEditor.formatValue(Number(((Number.isFinite(value) ? value : 0) + step).toFixed(6)))
        levelEditor.setProp(input)
    },
}

//*********************************************************************
// events
//*********************************************************************
{
    //during a run #dmg covers the canvas, so mouse events land on either one
    const isGameSurface = target => target.id === "canvas" || target.id === "dmg"
    document.body.addEventListener("mousedown", event => { //capture, before the body's listener, so a left click edits instead of firing
        if (isGameSurface(event.target)) levelEditor.mouseDown(event)
    }, true)
    window.addEventListener("wheel", event => {
        if (isGameSurface(event.target)) levelEditor.wheel(event)
    }, { passive: false })
    window.addEventListener("mousemove", event => {
        levelEditor.isMouseOnCanvas = isGameSurface(event.target)
        levelEditor.mouseMove(event)
    })
    document.documentElement.addEventListener("mouseleave", () => { levelEditor.isMouseOnCanvas = false })
    window.addEventListener("mouseup", levelEditor.mouseUp)
    window.addEventListener("keydown", levelEditor.keyDown) //added before index.js, so it runs before the game's keys
    window.addEventListener("keyup", event => { levelEditor.isFree = event.altKey })
    window.addEventListener("beforeunload", () => levelEditor.flush())

    for (const id of ["level-editor-left", "level-editor-right", "level-editor-code", "level-editor-status", "level-editor-history"]) {
        const panel = document.getElementById(id)
        //the panels aren't part of the game, so clicks don't fire and typing doesn't move the player
        panel.addEventListener("mousedown", event => event.stopPropagation())
        panel.addEventListener("keydown", event => {
            if (event.key === "Escape") levelEditor.revertField(event.target) //put the saved value back before blur commits it
            if (event.key === "Escape" && id === "level-editor-code") levelEditor.run("closeCode")
            if (id === "level-editor-code" && event.target.matches("textarea") && !event.target.readOnly) { //typing code
                if (event.key === "Tab") {
                    event.preventDefault()
                    event.target.setRangeText("    ", event.target.selectionStart, event.target.selectionEnd, "end")
                }
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault()
                    levelEditor.run(levelEditor.codeEditing && !document.querySelector('#level-editor-code [data-command="applyCode"]').hidden ? "applyCode" : "importText")
                }
            }
            if (event.key === "Escape" || (event.key === "Enter" && event.target.readOnly !== false)) event.target.blur() //enter types a new line in the import box
            event.stopPropagation()
        })
        panel.addEventListener("click", event => {
            const button = event.target.closest("button[data-command], pre[data-command]")
            if (!button) return
            if (button.closest("summary")) event.preventDefault() //the explorer's hide and lock don't fold their type
            if (levelEditor.isPaletteClick) return //it was dragged onto the level
            if (event.detail !== 0) button.blur() //like menus, so the field key (space) doesn't press it again
            levelEditor.run(button.dataset.command, button.dataset.arg)
        })
    }
    const left = document.getElementById("level-editor-left")
    left.addEventListener("toggle", event => {
        const section = event.target.dataset.section
        if (section === "load" && event.target.open) levelEditor.renderLoadList()
        if (section === "explorer" && event.target.open) levelEditor.renderExplorer()
        if (section) {
            const open = levelEditor.openSections()
            open[section] = event.target.open
            try {
                localStorage.setItem("levelEditorSections", JSON.stringify(open))
            } catch (error) { }
        }
    }, true) //toggle doesn't bubble
    document.getElementById("level-editor-left").addEventListener("mousedown", event => { //an add button can be dragged onto the level
        const button = event.button === 0 && event.target.closest('button[data-command="add"], button[data-command="preset"]')
        levelEditor.paletteDrag = button ? { command: button.dataset.command, arg: button.dataset.arg, x: event.clientX, y: event.clientY, isDragging: false } : null
    })
    window.addEventListener("mousemove", event => {
        const palette = levelEditor.paletteDrag
        if (palette && !palette.isDragging && Math.hypot(event.clientX - palette.x, event.clientY - palette.y) > 6) palette.isDragging = true
    })
    window.addEventListener("mouseup", () => {
        const palette = levelEditor.paletteDrag
        levelEditor.paletteDrag = null
        if (!palette || !palette.isDragging) return
        levelEditor.isPaletteClick = true //the click after letting go isn't another add
        setTimeout(() => { levelEditor.isPaletteClick = false }, 0)
        if (levelEditor.isMouseOnCanvas) levelEditor.place(levelEditor.creation(palette.command, palette.arg, levelEditor.mouse()))
    }, true)
    document.getElementById("level-editor-history").addEventListener("mouseover", event => { //a history step's tooltip is what it changed, worked out when it's first hovered
        const step = event.target.closest?.(".le-step")
        if (step && !step.dataset.diff) {
            step.dataset.diff = "1"
            step.title = `${step.title}\n\n${levelEditor.stepDiff(Number(step.dataset.arg))}`
        }
    })
    window.addEventListener("mousedown", event => { //clicking anywhere else closes the history list
        if (levelEditor.isHistoryOpen && !event.target.closest?.(".le-history-box")) levelEditor.run("history", false)
    }, true) //before the panels stop it
    const onSettingChange = event => { //the left panel and the status bar, which has grid and zoom
        if (event.target.dataset.key) levelEditor.setProp(event.target)
        if (event.target.dataset.add && event.target.value) { //a list that adds what's picked, like mob by name
            levelEditor.run("add", `${event.target.dataset.add}:${event.target.value}`)
            event.target.value = ""
            event.target.blur()
        }
        if (event.target.dataset.setting === "grid") {
            const size = Number(event.target.value)
            if (Number.isFinite(size) && size >= 1) levelEditor.grid = Math.round(size)
            event.target.value = levelEditor.grid
        }
        if (event.target.dataset.setting === "zoom") {
            const value = Number(event.target.value)
            if (Number.isFinite(value) && value > 0) levelEditor.zoomTo(value)
            event.target.value = Math.round(levelEditor.zoomScale)
        }
        if (event.target.dataset.setting === "testSpawning") {
            levelEditor.isTestSpawning = event.target.checked
            if (levelEditor.isTesting) levelEditor.restart()
            event.target.blur()
        }
        if (event.target.dataset.setting === "testLevel") {
            const value = Number(event.target.value)
            if (Number.isFinite(value) && value >= 0) {
                levelEditor.testLevel = Math.min(30, Math.round(value))
                levelEditor.restart()
            } else {
                event.target.value = levelEditor.testLevel
            }
        }
    }
    left.addEventListener("change", onSettingChange)
    document.getElementById("level-editor-status").addEventListener("change", onSettingChange)
    const right = document.getElementById("level-editor-right")
    right.addEventListener("change", event => {
        const input = event.target
        if (input.matches("[data-rotate]")) { //rotate by the angle typed
            const text = input.value.trim().replace(/°$/, "")
            const turn = Number(text)
            input.value = ""
            if (text !== "" && Number.isFinite(turn) && turn % 360) levelEditor.run("rotate", turn)
            return
        }
        if (input.dataset.linkTo && input.value) { //the button's link list
            const button = levelData.find(levelEditor.data, Number(input.dataset.linkTo))
            const el = levelData.find(levelEditor.data, Number(input.value))
            if (button && el) levelEditor.edit(`link ${levelEditor.describe([el])} to ${levelEditor.describe([button])}`, () => {
                el.link = button.id
                return [el.id]
            })
            return levelEditor.renderRight()
        }
        if (input.dataset.key) levelEditor.setProp(input)
        if (input.matches("[data-vertices]")) {
            const el = levelEditor.vertexElement()
            if (!el) return
            const { points, error } = levelElements.parsePath(el, input.value)
            if (error) { //keep what was typed so it can be fixed
                levelEditor.vertex.error = error
                levelEditor.vertex.text = input.value
                return levelEditor.renderRight()
            }
            levelEditor.setVertices(points, summary => `edit vertices ${summary}`)
        }
    })
    for (const panel of [left, right]) { //fields are in both panels, the level properties are in the inspector with nothing selected
        panel.addEventListener("input", event => {
            if (event.target.matches(".le-value")) event.target.style.width = levelEditor.fieldWidth(event.target.value)
            if (event.target.matches("[data-swatch]")) { //the color picker fills in the text next to it, and the level shows it right away
                const text = event.target.parentElement.querySelector("[data-key]")
                levelEditor.previewColor(text, event.target.value)
                text.style.width = levelEditor.fieldWidth(text.value)
            }
        })
        panel.addEventListener("change", event => {
            if (event.target.matches("[data-swatch]")) { //once the picker closes, so it's one undo step
                levelEditor.endPreview()
                levelEditor.setProp(event.target.parentElement.querySelector("[data-key]"))
            }
        })
        panel.addEventListener("focusout", event => {
            if (event.target.matches("[data-swatch]") && levelEditor.preview) { //closed without a change, put the color back
                levelEditor.endPreview()
                levelEditor.refreshFields(panel)
            }
        })
        panel.addEventListener("keydown", event => {
            if (event.target.matches("input.le-value") && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
                event.preventDefault()
                levelEditor.stepProp(event.target, (event.key === "ArrowUp" ? 1 : -1) * (event.shiftKey ? 10 : 1))
            }
        })
    }
}
