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
    tool: "map",
    tools: ["map", "block", "select"], //the draw tool, map and block draw new rects, select only selects and moves, the right mouse button always selects
    grid: 25, //snap size, hold alt to place freely
    isGridShown: true,
    isFree: false, //alt is held
    drag: null, //{ kind: "move" | "handle" | "draw" | "box" | "pan", ... } while the left or middle mouse button is held
    hoverId: null,
    isTesting: false, //start test restarts the level like a run, stop test restarts it for editing
    isTestSpawning: true, //the mobs, power ups checkbox, mobs and power ups spawn while testing, never while editing so it isn't a fight
    testLevel: 5, //level.levelsCleared while editing, for mob types, difficulty, and damage, at 0 random mobs don't spawn
    vertex: null, //{ id, active, error } while editing a map or block's vertices, active is the clicked vertex, error is why typed vertices didn't work
    pathDraw: null, //{ points } while drawing a path, see the drawPath command
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
        levelData.play(data, { isEditor: true, isSpawning: levelEditor.isTesting && levelEditor.isTestSpawning })
        level.disableExit = true //the exit charges, but doesn't leave
        simulation.setZoom(levelEditor.zoomScale)
        if (!levelEditor.gameCamera) levelEditor.gameCamera = simulation.camera
        simulation.camera = levelEditor.camera
        m.look = levelEditor.look
        simulation.removeEphemera("levelEditor", true)
        simulation.ephemera.push({ name: "levelEditor", do() { levelEditor.frame() } })
        document.body.classList.add("level-editor")
        levelEditor.renderLeft()
        levelEditor.renderRight()
    },
    close() { //also called by simulation.splashReturn()
        if (!levelEditor.isActive) return
        levelEditor.flush()
        levelEditor.isActive = false
        levelEditor.drag = null
        levelData.isEditor = false
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
    respawn() { //called by m.death(), dying while editing sends the player back to the spawn
        m.health = m.maxHealth
        m.displayHealth()
        m.immuneCycle = m.cycle + 60
        levelEditor.toSpawn()
        simulation.inGameConsole(`<em>//respawned</em>`)
    },
    toSpawn() {
        const where = levelEditor.data.elements.find(el => el.type === "spawn")
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
        const history = levelEditor.history
        history.steps.length = history.index + 1 //a new change replaces anything that was undone
        history.steps.push({ label, json })
        if (history.steps.length > levelEditor.historyLimit) history.steps.shift()
        history.index = history.steps.length - 1
        levelData.rebuild(ids)
        levelEditor.changed()
        return true
    },
    describe(elements) { //for history labels, one element with where it is, or how many of each type
        if (elements.length === 1) return levelElements.summary(elements[0])
        const counts = {}
        for (const el of elements) counts[el.type] = (counts[el.type] || 0) + 1
        return Object.keys(counts).map(type => `${counts[type]} ${type}`).join(", ")
    },
    changed() {
        levelEditor.selection = levelEditor.selection.filter(id => levelData.find(levelEditor.data, id))
        if (levelEditor.vertex && !levelEditor.vertexElement()) levelEditor.vertex = null
        levelEditor.save()
        levelEditor.refreshRight()
        levelEditor.refreshFields()
        levelEditor.updateHistoryButtons()
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
        levelData.rebuild(ids)
        levelEditor.changed()
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
    },
    flush() {
        if (levelEditor.saveTimer === null) return
        clearTimeout(levelEditor.saveTimer)
        levelEditor.saveTimer = null
        if (levelEditor.data) levelData.store.save(levelEditor.data)
    },

    //*********************************************************************
    // selection
    //*********************************************************************
    select(ids) {
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
    elementAt(point) { //the smallest element under point, so things on top of big map pieces can be picked
        let best = null
        let bestArea = Infinity
        for (const el of levelEditor.data.elements) {
            if (!levelElements.contains(el, point) && !levelData.runtimeContains(el.id, point)) continue
            const b = levelElements.bounds(el)
            const area = b.width * b.height
            if (area <= bestArea) { //ties go to the later element, it's drawn on top
                best = el
                bestArea = area
            }
        }
        return best
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
    },

    //*********************************************************************
    // mouse, left button uses the draw tool, right button always selects and moves, middle button pans
    // the field is still on its key (space), so the right button isn't needed for it
    //*********************************************************************
    mouseDown(event) {
        if (!levelEditor.isActive || simulation.paused) return
        if (event.button === 1) {
            event.preventDefault()
            levelEditor.drag = { kind: "pan", button: 1, moved: 0 }
            return
        }
        if (event.button !== 0 && event.button !== 2) return
        event.stopPropagation() //don't fire or use the field
        if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur() //finishes typing in the inspector
        const point = levelEditor.mouse()
        if (levelEditor.pathDraw) return levelEditor.pathClick(point, event.button)
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
        if (tool !== "select" && !isOnSelection) { //drawing, a click without dragging selects instead
            levelEditor.drag = { ...drag, kind: "draw", hitId: hit ? hit.id : null }
        } else if (hit) {
            if (event.shiftKey) {
                levelEditor.select(isOnSelection ? levelEditor.selection.filter(id => id !== hit.id) : levelEditor.selection.concat(hit.id))
                if (isOnSelection) return
            } else if (!isOnSelection) {
                levelEditor.select([hit.id])
            }
            levelEditor.drag = { ...drag, kind: "move", originals: levelEditor.selected().map(el => levelData.copy(el)) }
        } else {
            if (!event.shiftKey) levelEditor.select([])
            levelEditor.drag = { ...drag, kind: "box", isAdding: event.shiftKey }
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
            if (drag.moved < 4) levelEditor.pan = { x: 0, y: 0 } //middle click centers on the player
            return
        }
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
            const inside = levelEditor.data.elements.filter(el => {
                const b = levelElements.bounds(el)
                return b.x >= box.x && b.y >= box.y && b.x + b.width <= box.x + box.width && b.y + b.height <= box.y + box.height
            }).map(el => el.id)
            levelEditor.select(drag.isAdding ? [...new Set(levelEditor.selection.concat(inside))] : inside)
        } else { //move or handle, the data didn't change during the drag, only the preview did
            const changed = levelEditor.dragPreview(drag)
            for (const el of changed) Object.assign(levelData.find(levelEditor.data, el.id), el)
            const f = levelEditor.formatValue
            const by = changed.length > 1 ? ` by ${f(changed[0].x - drag.originals[0].x)}, ${f(changed[0].y - drag.originals[0].y)}` : "" //one element shows where it ended up, more show how far they moved
            const verb = drag.kind === "move" ? "move" : drag.handle.startsWith("spot") ? `move spot ${Number(drag.handle.slice(4)) + 2} of` : "resize" //a boss's other spots are handles too
            levelEditor.commit(`${verb} ${levelEditor.describe(changed)}${by}`, drag.before, changed.map(el => el.id))
        }
    },
    wheel(event) {
        if (!levelEditor.isActive || simulation.paused) return
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
        if (drag.kind === "handle") {
            const el = levelData.copy(drag.original)
            levelElements.dragHandle(el, drag.handle, levelEditor.snapPoint(point), levelEditor.isFree ? 1 : levelEditor.grid)
            return [el]
        }
        const dx = levelEditor.snap(point.x - drag.start.x)
        const dy = levelEditor.snap(point.y - drag.start.y)
        return drag.originals.map(original => {
            const el = levelData.copy(original)
            levelElements.move(el, dx, dy)
            return el
        })
    },

    vertexPreview(drag) { //the shape's world points with the dragged vertex at the mouse, and why it can't be made
        const points = drag.points.map(p => ({ x: p.x, y: p.y }))
        points[drag.index] = levelEditor.snapPoint(levelEditor.mouse())
        return { points, error: levelElements.checkPoints(points, levelData.find(levelEditor.data, drag.id)) }
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
                levelEditor.renderLeft()
            },
        },
        grid: {
            label: "grid lines", run() {
                levelEditor.isGridShown = !levelEditor.isGridShown
                levelEditor.renderLeft()
            },
        },
        deselect: {
            label: "deselect", keys: ["escape"], run() {
                levelEditor.drag = null
                const code = document.getElementById("level-editor-code")
                if (code.classList.contains("le-open")) return code.classList.remove("le-open") //esc closes the javascript first
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
        selectAll: { label: "select all", keys: ["mod+a"], run: () => levelEditor.select(levelEditor.data.elements.map(el => el.id)) },
        delete: {
            label: "delete", keys: ["delete", "backspace"], run() {
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
                const elements = levelEditor.selected().filter(el => !levelEditor.isSingleton(el))
                const ids = elements.map(el => el.id)
                if (!ids.length) return
                levelEditor.edit(`delete ${levelEditor.describe(elements)}`, data => {
                    data.elements = data.elements.filter(el => !ids.includes(el.id))
                    return ids
                })
            },
        },
        copy: { label: "copy", keys: ["mod+c"], run: () => { levelEditor.clipboard = levelEditor.selected().filter(el => !levelEditor.isSingleton(el)).map(levelData.copy) } },
        cut: {
            label: "cut", keys: ["mod+x"], run() {
                levelEditor.run("copy")
                levelEditor.run("delete")
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
                levelEditor.paste("duplicate", levelEditor.selected().filter(el => !levelEditor.isSingleton(el)), offset, offset)
            },
        },
        add: { //an element from an add menu, in the middle of the view, "powerUp:heal" uses the type's preset("heal")
            label: "add", run(arg) {
                const [typeName, preset] = arg.split(":")
                const type = levelElements.types[typeName]
                const values = preset && type.preset ? type.preset(preset, levelEditor.data) : {}
                const el = levelElements.create(typeName, values)
                if (values.x === undefined || values.y === undefined) { //presets with a place stay there, like the exit color around the exit
                    const b = levelElements.bounds(el)
                    const center = levelEditor.snapPoint(levelEditor.viewCenter())
                    levelElements.move(el, center.x - levelEditor.snap(b.x + b.width / 2), center.y - levelEditor.snap(b.y + b.height / 2))
                }
                levelEditor.unstack(el)
                levelEditor.edit(`add ${preset ? `${preset} ` : ""}${levelEditor.describe([el])}`, data => [levelData.add(data, el).id])
                levelEditor.select([el.id])
            },
        },
        drawPath: { //click to add points, click the first point to close it, click the last point, enter, or right click to finish
            label: "draw a path, click to add points, click the first point to close it, enter or right click to finish", run() {
                if (levelEditor.pathDraw) return levelEditor.finishPath(false)
                levelEditor.pathDraw = { points: [] }
                levelEditor.select([])
                levelEditor.renderLeft()
            },
        },
        finishPath: { label: "finish the path", keys: ["enter"], run: () => levelEditor.pathDraw && levelEditor.finishPath(false) },
        preset: { //a common shape from levelElements.presets, as map, or block with the block tool, in the middle of the view
            label: "shape", run(name) {
                const preset = levelElements.presets.find(p => p.name === name)
                const typeName = levelEditor.tool === "block" ? "block" : "map"
                const [w, h] = preset.size
                const center = levelEditor.snapPoint(levelEditor.viewCenter())
                const x = levelEditor.snap(center.x - w / 2)
                const y = levelEditor.snap(center.y - h / 2)
                const elements = preset.rects ?
                    preset.rects(w, h).map(([rx, ry, rw, rh]) => levelElements.create(typeName, { x: x + rx, y: y + ry, width: rw, height: rh })) :
                    [levelElements.create(typeName)]
                if (!preset.rects) levelElements.setPoints(elements[0], preset.points(w, h).map(([px, py]) => ({ x: x + px, y: y + py })))
                const ids = []
                levelEditor.edit(`add ${name} ${levelEditor.describe(elements)}`, data => {
                    for (const el of elements) ids.push(levelData.add(data, el).id)
                    return ids
                })
                levelEditor.select(ids)
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
            label: "restart the level at the spawn to play it, again to stop", run() {
                levelEditor.isTesting = !levelEditor.isTesting
                levelEditor.renderLeft()
                levelEditor.restart()
            },
        },
        code: {
            label: "level as javascript", run() {
                levelEditor.openPanel(`${levelData.functionName(levelEditor.data.name)}()`, levelData.code(levelEditor.data))
            },
        },
        copyCode: {
            label: "copy the javascript", run() {
                levelEditor.copy(levelData.code(levelEditor.data), `${levelData.functionName(levelEditor.data.name)}() javascript`)
            },
        },
        analyze: {
            label: "check the level against the written levels", run() {
                const report = levelAnalysis.run(levelEditor.data, { isLive: true })
                levelEditor.openPanel(`${levelEditor.data.name} analysis`, levelAnalysis.text(report), levelAnalysis.html(report))
            },
        },
        copyPanel: {
            label: "copy", run() {
                const panel = document.getElementById("level-editor-code")
                levelEditor.copy(panel.querySelector("textarea").value, panel.querySelector("[data-code-name]").textContent)
            },
        },
        pool: { //in or out of the random level pool from settings, without opening it
            label: "in the random level pool for runs", run() {
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
        newLevel: { label: "new level", run: () => levelEditor.setData(levelData.blank(levelData.freeName("untitled"))) },
        load: { label: "load", run: arg => levelEditor.load(arg) },
        deleteLevel: {
            label: "delete level", run(name) {
                if (!confirm(`delete ${name}?`)) return
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
        hover: "rgba(0,170,255,0.6)",
        guide: "rgba(0,120,255,0.4)",
        grid: "rgba(0,0,0,0.06)",
        axis: "rgba(0,0,0,0.15)",
    },
    frame() {
        if (!levelEditor.isActive) return
        const point = levelEditor.mouse()
        const drag = levelEditor.drag
        const hover = drag || levelEditor.pathDraw || !levelEditor.isMouseOnCanvas ? null : levelEditor.elementAt(point)
        levelEditor.hoverId = hover ? hover.id : null
        if (levelEditor.isGridShown) levelEditor.drawGrid()
        levelEditor.drawGuides()
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
        if (levelEditor.isMouseOnCanvas) levelEditor.drawLabel(point)
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
            if (type && type.overlay) type.overlay(el)
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
        } else if (drag && (drag.kind === "move" || drag.kind === "handle")) {
            const el = levelEditor.dragPreview(drag)[0]
            const f = levelEditor.formatValue
            const p = levelEditor.snapPoint(point)
            text = el.width !== undefined && !el.vertices ? `${f(el.x)}, ${f(el.y)}  ${f(el.width)} × ${f(el.height)}` : drag.kind === "handle" ? `${f(p.x)}, ${f(p.y)}` : `${f(el.x)}, ${f(el.y)}`
        } else if (levelEditor.tool !== "select") {
            const p = levelEditor.snapPoint(point)
            text = `${p.x}, ${p.y}`
        } else {
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
    sections: [ //{ id, title, key, isClosed, render() }, without a title it's always shown, with one it can be folded, isClosed starts it folded, key is a command whose key shows by the title
        {
            id: "top",
            render: () => `<div class="le-row">
                <span class="le-info" data-level-info>${levelEditor.infoText()}</span>
                <span class="le-fill"></span>${levelEditor.button("exit", "exit")}
            </div>`,
        },
        {
            id: "tool",
            render: () => `<div class="le-row">
                <span class="le-label">draw</span>
                <span class="le-segment">${levelEditor.tools.map(tool => levelEditor.button("tool", tool, tool, levelEditor.tool === tool)).join("")}</span>
                <span class="le-fill"></span>${levelEditor.keyCap("tool")}
            </div>
            <div class="le-row">
                <span class="le-label">grid</span>
                <input class="le-number" data-setting="grid" value="${levelEditor.grid}" spellcheck="false" title="snap size, hold alt to place freely">
                ${levelEditor.button("grid", "lines", "", levelEditor.isGridShown)}
            </div>
            <div class="le-row">
                ${levelEditor.button("test", levelEditor.isTesting ? "stop test" : "start test", "", levelEditor.isTesting)}
                <label class="le-label le-check" title="mobs and power ups spawn while testing"><input type="checkbox" data-setting="testSpawning"${levelEditor.isTestSpawning ? " checked" : ""}>mobs, power ups</label>
                <span class="le-fill"></span>
                <span class="le-label le-tight" title="levels cleared while editing, for mob types and difficulty">level</span>
                <input class="le-number le-short" data-setting="testLevel" value="${levelEditor.testLevel}" spellcheck="false" title="levels cleared while editing, for mob types and difficulty">
            </div>`,
        },
        {
            id: "levelProps",
            title: "level properties",
            isClosed: true,
            render: () => `${levelEditor.levelFields()}<div class="le-row"><span class="le-fill"></span>${levelEditor.button("levelDefaults", "default")}</div>`,
        },
        {
            id: "add",
            title: "add level element",
            render: () => `<div class="le-shapes">${levelElements.presets.map(preset => `<button class="le-button le-shape" data-command="preset" data-arg="${preset.name}" title="${preset.name}, as map, or block with the block tool">${levelElements.presetIcon(preset)}</button>`).join("")}</div>
                <div class="le-grid">${levelEditor.addButtons("element")}</div>`,
        },
        {
            id: "mobs",
            title: "add mobs",
            render: () => `<div class="le-grid">${["mobSpot", "boss", "secondaryBoss"].map(name => levelEditor.addButton(name)).join("")}</div>
                <div class="le-grid">${levelEditor.addButtons("mob", ["mobSpot", "boss", "secondaryBoss", "namedMob"])}</div>
                <div class="le-row">${levelEditor.mobList()}</div>`, //spots, a boss, and a 2nd boss are all a level needs, the rest are for special cases
        },
        {
            id: "powerUps",
            title: "add power ups",
            render: () => { //starting, random, and debris are what a level needs, they show the power ups they can be
                const main = { startingPowerUps: ["gun", "tech", "ammo", "heal"], randomPowerUp: ["heal", "ammo"], debris: ["block", "heal", "ammo"] }
                return `<div class="le-grid le-tall">${Object.entries(main).map(([name, orbs]) => levelEditor.addButton(name, `${levelElements.types[name].label}<br>${orbs.map(levelEditor.orb).join("")}`)).join("")}</div>
                    <div class="le-grid">${levelEditor.presetButtons("powerUp", name => `${levelEditor.orb(name)}${name}`)}${levelEditor.addButtons("powerUp", ["powerUp", ...Object.keys(main)])}</div>`
            },
        },
        {
            id: "load",
            title: "load level",
            isClosed: true,
            render: () => `<div class="le-row">${levelEditor.button("newLevel", "new")}</div>
                <div class="le-load" data-load-list></div>`, //filled in when it opens, see renderLoadList()
        },
        {
            id: "history",
            title: "history",
            key: "undo", //its key shows on the right of the title
            isClosed: true,
            render: () => `<div class="le-grid le-two">${levelEditor.button("undo", "undo")}${levelEditor.button("redo", "redo")}</div>
                <div class="le-history" data-history>${levelEditor.historyList()}</div>`,
        },
        {
            id: "export",
            title: "export",
            render: () => `<div class="le-grid le-two">${levelEditor.button("code", "javascript")}${levelEditor.button("copyCode", "copy")}${levelEditor.button("pool", "level pool", "", levelEditor.isInPool())}${levelEditor.button("analyze", "analysis")}</div>`,
        },
    ],
    openPanel(name, text, html) { //the code panel in the middle of the screen, html shows instead of the text when there is some, copy always copies the text
        const panel = document.getElementById("level-editor-code")
        const textarea = panel.querySelector("textarea")
        const report = panel.querySelector(".le-report")
        textarea.value = text
        textarea.hidden = !!html
        report.hidden = !html
        report.innerHTML = html || ""
        panel.querySelector("[data-code-name]").textContent = name
        panel.classList.add("le-open")
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
    orb(name) { //the power up's orb from powerUps.orb, without the game's hover help, "block" is a little block
        if (name === "block") return `<span class="le-orb"><span class="le-block-icon"></span></span>`
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
            `<details class="le-section" data-section="${section.id}"${open[section.id] ?? !section.isClosed ? " open" : ""}><summary>${section.title}${section.key ? levelEditor.keyCap(section.key) : ""}</summary>${section.render()}</details>` :
            `<div class="le-section">${section.render()}</div>`).join("")
        levelEditor.updateHistoryButtons()
        if (document.querySelector('#level-editor-left [data-section="load"]').open) levelEditor.renderLoadList()
    },
    infoText() { //the top of the left panel, which level this is
        const count = levelEditor.data.elements.length
        return `<span class="le-name">${levelEditor.escape(levelEditor.data.name)}</span> <span class="le-id">${count} element${count === 1 ? "" : "s"}</span>`
    },
    updateHistoryButtons() {
        const left = document.getElementById("level-editor-left")
        const info = left.querySelector("[data-level-info]")
        if (info) info.innerHTML = levelEditor.infoText() //after any change, and renaming
        const history = levelEditor.history
        const undo = left.querySelector(`[data-command="undo"]`)
        const redo = left.querySelector(`[data-command="redo"]`)
        if (undo) undo.disabled = history.index === 0
        if (redo) redo.disabled = history.index === history.steps.length - 1
        const list = left.querySelector("[data-history]")
        if (list) {
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
        const group = (title, items, note = "") => items.length ? `<div class="le-label le-load-header">${title}${note}</div><div class="le-grid le-load-grid">${items.join("")}</div>` : ""
        levelEditor.flush() //so the level being edited counts
        const written = (source, names) => names.map(name => levelEditor.button("load", name, `${source}:${name}`))
        const hidden = ["template", "testing", "null"]
        document.querySelector("#level-editor-left [data-load-list]").innerHTML =
            group("local", levelData.store.names().map(name => `<span class="le-pair">${levelEditor.button("load", name, `local:${name}`, name === current)}${levelEditor.button("deleteLevel", "×", name)}</span>`), levelEditor.storageText()) +
            group("n-gon", written("written", Object.keys(level.maps).filter(name => !hidden.includes(name)))) +
            group("community", written("more", level.communityLevels)) +
            group("training", written("more", level.trainingLevels)) +
            group("testing", written("written", ["testing"])) //the level.maps.testing sandbox
    },

    //*********************************************************************
    // inspector, the right panel, the selected element's properties written like code
    //*********************************************************************
    renderRight() {
        const elements = levelEditor.selected()
        const panel = document.getElementById("level-editor-right")
        if (elements.length === 1) {
            panel.innerHTML = levelEditor.inspectElement(elements[0])
        } else if (elements.length > 1) {
            panel.innerHTML = levelEditor.inspectMany(elements)
        } else {
            panel.innerHTML = levelEditor.inspectLevel()
        }
        levelEditor.inspected = elements.map(el => `${el.id}:${el.type}`).join()
    },
    refreshRight() { //redraws, or while a field has focus only updates the values, so typing and arrow keys aren't interrupted
        const elements = levelEditor.selected()
        const panel = document.getElementById("level-editor-right")
        if (elements.map(el => `${el.id}:${el.type}`).join() !== levelEditor.inspected || !panel.contains(document.activeElement)) return levelEditor.renderRight()
        levelEditor.refreshFields(panel)
    },
    refreshFields(root = document.getElementById("level-editor-left")) { //new values in the fields, except the one being typed in, the level properties are in the left panel
        for (const input of root.querySelectorAll("[data-key]")) {
            if (input === document.activeElement) continue
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
        const owner = levelEditor.ownerOf(input)
        const key = input.dataset.key
        if (!owner) return
        if (!levelEditor.preview || levelEditor.preview.owner !== owner || levelEditor.preview.key !== key) levelEditor.preview = { owner, key, value: owner[key] }
        input.value = levelEditor.pickedColor(hex, levelEditor.preview.value)
        owner[key] = input.value
        if (owner === levelEditor.data) {
            levelData.applySettings(owner)
        } else {
            levelData.rebuild([owner.id])
        }
    },
    endPreview() {
        const preview = levelEditor.preview
        if (!preview) return
        levelEditor.preview = null
        preview.owner[preview.key] = preview.value
        if (preview.owner === levelEditor.data) {
            levelData.applySettings(preview.owner)
        } else if (levelData.find(levelEditor.data, preview.owner.id)) {
            levelData.rebuild([preview.owner.id])
        }
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
    inspectElement(el) {
        const type = levelElements.types[el.type]
        const runtime = levelData.runtimes.get(el.id)
        const isShape = levelElements.groups.shape.includes(el.type)
        const isVertexEditable = levelElements.isVertexEditable(el)
        const shapes = isShape ? `<span class="le-segment">${levelElements.groups.shape.map(name => levelEditor.button("shape", name, name, el.type === name)).join("")}</span>` : ""
        const props = type ? type.props : []
        const isVertexMode = levelEditor.vertexElement() === el
        return `<div class="le-row"><span class="le-name">${el.type}</span><span class="le-id">#${el.id}</span><span class="le-fill"></span>${shapes}</div>
            <div class="le-code"><span class="color-symbol">{</span>
                ${props.map(prop => levelEditor.field(el, prop)).join("")}
                ${isVertexMode ? levelEditor.inspectVertices(el) : el.vertices ? `<div class="le-prop"><span class="color-var">vertices</span><span class="color-symbol">:</span> <span class="le-comment">[${el.vertices.length}]</span><span class="color-symbol">,</span></div>` : ""}
            <span class="color-symbol">}</span></div>
            ${Array.isArray(el.spots) ? levelEditor.inspectSpots(el) : ""}
            ${isVertexMode && levelEditor.vertex.error ? `<div class="le-error">//${levelEditor.escape(levelEditor.vertex.error)}</div>` : ""}
            ${!type ? `<div class="le-comment">//unknown type</div>` : ""}
            ${runtime && runtime.error ? `<div class="le-error">//${levelEditor.escape(runtime.error.message)}</div>` : ""}
            <div class="le-row">
                ${isVertexEditable ? levelEditor.button("vertices", "vertices", "", isVertexMode) : ""}
                <span class="le-fill"></span>
                ${type && type.isSingleton ? "" : `<span class="le-segment">${levelEditor.button("duplicate", "duplicate")}${levelEditor.button("delete", "delete")}</span>`}
            </div>`
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
    inspectMany(elements) {
        const counts = {}
        for (const el of elements) counts[el.type] = (counts[el.type] || 0) + 1
        const isShapes = elements.every(el => levelElements.groups.shape.includes(el.type))
        return `<div class="le-row"><span class="le-name">${elements.length} selected</span></div>
            <div class="le-comment">//${Object.keys(counts).map(type => `${counts[type]} ${type}`).join(", ")}</div>
            <div class="le-row">
                ${isShapes ? levelElements.groups.shape.map(name => levelEditor.button("shape", name, name)).join("") : ""}
                <span class="le-fill"></span><span class="le-segment">${levelEditor.button("duplicate", "duplicate")}${levelEditor.button("delete", "delete")}</span>
            </div>`
    },
    inspectLevel() { //nothing selected, the level properties are in the left panel
        const counts = {}
        for (const el of levelEditor.data.elements) counts[el.type] = (counts[el.type] || 0) + 1
        return `<div class="le-row"><span class="le-name">level</span><span class="le-id">"${levelEditor.escape(levelEditor.data.name)}"</span></div>
            <div class="le-comment">//${Object.keys(counts).map(type => `${counts[type]} ${type}`).join(", ")}</div>`
    },
    levelFields() { //the level properties menu
        return `<div class="le-code le-level-props">${levelElements.level.props.map(prop => levelEditor.field(levelEditor.data, prop)).join("")}</div>`
    },
    revertField(input) {
        if (input.matches && input.matches("[data-vertices]") && levelEditor.vertexElement()) {
            levelEditor.vertex.error = ""
            input.value = levelElements.pathText(levelEditor.vertexElement())
            return
        }
        if (!input.dataset || !input.dataset.key) return
        const owner = levelEditor.ownerOf(input)
        const prop = levelEditor.findProp(input.dataset.key, owner)
        if (prop && input.type !== "checkbox") input.value = levelEditor.formatValue(levelEditor.propValue(owner, prop))
    },
    setProp(input) { //from a field, for the selected element, or the level for level property fields
        const key = input.dataset.key
        const owner = levelEditor.ownerOf(input)
        const prop = levelEditor.findProp(key, owner)
        if (!prop) return
        let value = input.value
        if (prop.kind === "bool") value = input.checked
        if (prop.kind === "number") {
            value = Number(input.value)
            if (input.value.trim() === "" || !Number.isFinite(value)) return levelEditor.revertField(input) //not a number, put the old value back
            if (prop.min !== undefined) value = Math.max(prop.min, value)
        }
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
        const prop = levelEditor.findProp(input.dataset.key, levelEditor.ownerOf(input))
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

    for (const id of ["level-editor-left", "level-editor-right", "level-editor-code"]) {
        const panel = document.getElementById(id)
        //the panels aren't part of the game, so clicks don't fire and typing doesn't move the player
        panel.addEventListener("mousedown", event => event.stopPropagation())
        panel.addEventListener("keydown", event => {
            if (event.key === "Escape") levelEditor.revertField(event.target) //put the saved value back before blur commits it
            if (event.key === "Escape" && id === "level-editor-code") levelEditor.run("closeCode")
            if (event.key === "Escape" || event.key === "Enter") event.target.blur()
            event.stopPropagation()
        })
        panel.addEventListener("click", event => {
            const button = event.target.closest("button[data-command]")
            if (!button) return
            if (event.detail !== 0) button.blur() //like menus, so the field key (space) doesn't press it again
            levelEditor.run(button.dataset.command, button.dataset.arg)
        })
    }
    const left = document.getElementById("level-editor-left")
    left.addEventListener("toggle", event => {
        const section = event.target.dataset.section
        if (section) {
            const open = levelEditor.openSections()
            open[section] = event.target.open
            try {
                localStorage.setItem("levelEditorSections", JSON.stringify(open))
            } catch (error) { }
        }
        if (section === "load" && event.target.open) levelEditor.renderLoadList()
    }, true) //toggle doesn't bubble
    left.addEventListener("change", event => {
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
    })
    const right = document.getElementById("level-editor-right")
    right.addEventListener("change", event => {
        const input = event.target
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
    for (const panel of [left, right]) { //fields are in both panels, the level properties are in the left one
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
