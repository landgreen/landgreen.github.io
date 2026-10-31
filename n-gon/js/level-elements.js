"use strict";
//the kinds of things a local level is made of, used by levelData to build levels and by levelEditor to edit them
//each type is plain data plus a build() that makes it in the world with the same level.* and spawn.* helpers the written levels use
//add a new type with levelElements.define(), see docs/level-editor.md
const levelElements = {
    types: {},
    groups: { core: [], shape: [], element: [], mob: [], powerUp: [] }, //type names in the order they were defined, element, mob, and powerUp are the editor's add menus
    buildOrder: ["core", "shape", "element", "mob", "powerUp"], //mobs and power ups go in after the map they stand on, like in written levels

    //*********************************************************************
    // properties, shown and edited in the editor's inspector
    //*********************************************************************
    //{ key, kind: "number" | "bool" | "text" | "select", step, min, max, options, read(el), write(el, value) }
    //read and write are for values worked out from other values, like a block's mass from its density
    prop: {
        number(key, settings = {}) { return { key, kind: "number", ...settings } },
        bool(key, settings = {}) { return { key, kind: "bool", ...settings } },
        text(key, settings = {}) { return { key, kind: "text", ...settings } },
        color(key, settings = {}) { return { key, kind: "color", ...settings } }, //text with a color picker
        select(key, options, settings = {}) { return { key, kind: "select", options, ...settings } },
    },
    position() {
        return [levelElements.prop.number("x", { isGrid: true }), levelElements.prop.number("y", { isGrid: true })]
    },
    rect() { //a shape with vertices has a width and height too, its bounds, changing them stretches it
        const size = key => levelElements.prop.number(key, {
            isGrid: true,
            min: 1,
            read: el => el.vertices ? Number(levelElements.bounds(el)[key].toFixed(3)) : el[key],
            write(el, value) {
                if (!el.vertices) return el[key] = value
                const box = levelElements.bounds(el)
                box[key] = value
                levelElements.stretch(el, box)
            },
        })
        return [...levelElements.position(), size("width"), size("height")]
    },

    //*********************************************************************
    // geometry, a type can replace any of these, the defaults work for anything with x, y, and maybe width and height
    //*********************************************************************
    bounds(el) { //{ x, y, width, height } in world space, for selecting, hovering, and box select
        const type = levelElements.types[el.type]
        if (type && type.bounds) return type.bounds(el)
        if (el.vertices) return levelElements.boundsOf(levelElements.points(el))
        if (el.width !== undefined) return { x: el.x, y: el.y, width: el.width, height: el.height }
        return { x: el.x - 25, y: el.y - 25, width: 50, height: 50 }
    },
    points(el) { //outline in world space, rect corners or a shape's vertices
        if (el.vertices) return el.vertices.map(v => ({ x: el.x + v[0], y: el.y + v[1] }))
        const b = levelElements.bounds(el)
        return [{ x: b.x, y: b.y }, { x: b.x + b.width, y: b.y }, { x: b.x + b.width, y: b.y + b.height }, { x: b.x, y: b.y + b.height }]
    },
    boundsOf(points) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const p of points) {
            if (p.x < minX) minX = p.x
            if (p.y < minY) minY = p.y
            if (p.x > maxX) maxX = p.x
            if (p.y > maxY) maxY = p.y
        }
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
    },
    contains(el, point) {
        const type = levelElements.types[el.type]
        if (type && type.contains) return type.contains(el, point)
        if (el.vertices) return levelElements.isInside(levelElements.points(el), point)
        const b = levelElements.bounds(el)
        return point.x >= b.x && point.x <= b.x + b.width && point.y >= b.y && point.y <= b.y + b.height
    },
    move(el, dx, dy, isWhole = false) { //isWhole moves parts that otherwise stay put, like a boss's other spots when it's copied
        const type = levelElements.types[el.type]
        if (type && type.move) return type.move(el, dx, dy, isWhole)
        el.x += dx
        el.y += dy
    },
    handles(el) { //drag points for resizing, [{ id, x, y }], see levelElements.dragHandle(), shapes with vertices use their bounds
        const type = levelElements.types[el.type]
        if (type && type.handles) return type.handles(el)
        if (el.width === undefined && !el.vertices) return []
        const { x, y, width: w, height: h } = el.vertices ? levelElements.bounds(el) : el
        return [
            { id: "nw", x, y }, { id: "n", x: x + w / 2, y }, { id: "ne", x: x + w, y },
            { id: "e", x: x + w, y: y + h / 2 }, { id: "se", x: x + w, y: y + h }, { id: "s", x: x + w / 2, y: y + h },
            { id: "sw", x, y: y + h }, { id: "w", x, y: y + h / 2 },
        ]
    },
    dragHandle(el, id, point, min) { //move a handle to point, min is the smallest size
        const type = levelElements.types[el.type]
        if (type && type.dragHandle) return type.dragHandle(el, id, point, min)
        if (el.vertices) { //resize its bounds like a rect, then stretch the shape to fit
            const box = levelElements.bounds(el)
            levelElements.dragHandle(box, id, point, min)
            return levelElements.stretch(el, box)
        }
        const right = el.x + el.width
        const bottom = el.y + el.height
        if (id.includes("w")) {
            el.x = Math.min(point.x, right - min)
            el.width = right - el.x
        }
        if (id.includes("e")) el.width = Math.max(min, point.x - el.x)
        if (id.includes("n")) {
            el.y = Math.min(point.y, bottom - min)
            el.height = bottom - el.y
        }
        if (id.includes("s")) el.height = Math.max(min, point.y - el.y)
    },

    stretch(el, box) { //fit a shape with vertices to a new bounds box
        const from = levelElements.bounds(el)
        const round = n => Math.round(n * 1000) / 1000
        levelElements.setPoints(el, levelElements.points(el).map(p => ({
            x: round(box.x + (p.x - from.x) * box.width / (from.width || 1)),
            y: round(box.y + (p.y - from.y) * box.height / (from.height || 1)),
        })))
    },
    //*********************************************************************
    // presets, common shapes from written levels for the editor's add menu, made as map, or block when the block tool is on
    // points(w, h) is the outline in a w × h box with its top left at 0, 0, rects(w, h) makes several rects instead, like stairs
    //*********************************************************************
    presets: [
        { name: "rounded rect", size: [400, 200], points: (w, h, c = Math.min(50, w / 4, h / 4)) => [[c, 0], [w - c, 0], [w, c], [w, h - c], [w - c, h], [c, h], [0, h - c], [0, c]] }, //like spawn.bodyRectCorner
        { name: "rounded bottom", size: [150, 400], points: (w, h, c = Math.min(40, w / 4, h / 4)) => [[0, 0], [w, 0], [w, h - c], [w - c, h], [c, h], [0, h - c]] },
        { name: "trapezoid", size: [400, 100], points: (w, h) => [[w / 4, 0], [w * 3 / 4, 0], [w, h], [0, h]] },
        { name: "upside down trapezoid", size: [400, 100], points: (w, h) => [[0, 0], [w, 0], [w * 3 / 4, h], [w / 4, h]] },
        { name: "ramp up right", size: [400, 200], points: (w, h) => [[w, 0], [w, h], [0, h]] },
        { name: "ramp up left", size: [400, 200], points: (w, h) => [[0, 0], [w, h], [0, h]] },
        { name: "pointed ends", size: [600, 150], points: (w, h, c = Math.min(h * 0.75, w / 4)) => [[c, 0], [w - c, 0], [w, h / 2], [w - c, h], [c, h], [0, h / 2]] },
        { name: "pointed pillar", size: [150, 600], points: (w, h, c = Math.min(w * 0.4, h / 4)) => [[w / 2, 0], [w, c], [w, h - c], [w / 2, h], [0, h - c], [0, c]] },
        { name: "point down", size: [300, 500], points: (w, h) => [[0, 0], [w, 0], [w, h * 0.85], [w / 2, h], [0, h * 0.85]] },
        { name: "point up", size: [300, 500], points: (w, h) => [[w / 2, 0], [w, h * 0.15], [w, h], [0, h], [0, h * 0.15]] },
        { name: "diamond", size: [300, 400], points: (w, h) => [[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]] },
        { name: "spike", size: [200, 200], points: (w, h) => [[w / 2, 0], [w, h], [0, h]] },
        { name: "stairs up right", size: [600, 300], rects: (w, h, steps = 4) => Array.from({ length: steps }, (_, i) => [w * i / steps, h * (steps - 1 - i) / steps, w / steps, h * (i + 1) / steps]) }, //like spawn.spawnStairs
        { name: "stairs up left", size: [600, 300], rects: (w, h, steps = 4) => Array.from({ length: steps }, (_, i) => [w * i / steps, h * i / steps, w / steps, h * (steps - i) / steps]) },
    ],
    presetIcon(preset, size = 18) { //a tiny drawing of the preset for its button
        const [w, h] = preset.size
        const k = (size - 2) / Math.max(w, h)
        const ox = (size - w * k) / 2
        const oy = (size - h * k) / 2
        const xy = (x, y) => `${(ox + x * k).toFixed(1)},${(oy + y * k).toFixed(1)}`
        const shapes = preset.rects ?
            preset.rects(w, h).map(([x, y, rw, rh]) => `<rect x="${(ox + x * k).toFixed(1)}" y="${(oy + y * k).toFixed(1)}" width="${(rw * k).toFixed(1)}" height="${(rh * k).toFixed(1)}"/>`).join("") :
            `<polygon points="${preset.points(w, h).map(([x, y]) => xy(x, y)).join(" ")}"/>`
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="currentColor" stroke="none" aria-hidden="true">${shapes}</svg>`
    },

    //*********************************************************************
    // making elements
    //*********************************************************************
    define(name, type) {
        type.name = name
        type.label = type.label || name
        type.props = type.props || []
        levelElements.types[name] = type
        levelElements.groups[type.group].push(name)
    },
    create(typeName, values = {}) { //a new element with the type's defaults, levelData.add() gives it an id
        const type = levelElements.types[typeName]
        return { type: typeName, ...type.defaults(), ...values }
    },
    fillDefaults(el) { //older saves are missing properties added to a type later
        const type = levelElements.types[el.type]
        if (!type) return el
        const defaults = type.defaults()
        for (const key of Object.keys(defaults)) {
            if (el[key] === undefined && !(key === "width" && el.vertices) && !(key === "height" && el.vertices)) el[key] = defaults[key]
        }
        return el
    },
    shapeGeometry(el) { //the part of a map or block that stays when switching between them
        return el.vertices ? { x: el.x, y: el.y, vertices: el.vertices.map(v => v.slice()) } : { x: el.x, y: el.y, width: el.width, height: el.height }
    },
    matterBody(el, properties) { //a Matter body for a map or block, rect or vertices
        if (el.vertices) return Matter.Bodies.fromVertices(el.x, el.y, [el.vertices.map(v => ({ x: v[0], y: v[1] }))], properties)
        return Bodies.rectangle(el.x + el.width / 2, el.y + el.height / 2, el.width, el.height, properties)
    },
    //*********************************************************************
    // vertices, for the editor's vertex tool, a map or block is a rect or a list of vertices
    // shapes have to be convex: without the poly-decomp library Matter turns a concave shape into its hull,
    // so the level would collide differently than it looks, written levels make dents from several convex pieces
    //*********************************************************************
    vertexLimit: 64,
    minArea: 100, //10 × 10
    isInside(points, point) { //works for any simple shape, either winding
        let isIn = false
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const a = points[i]
            const b = points[j]
            if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) isIn = !isIn
        }
        return isIn
    },
    polygonArea(points) { //signed
        let area = 0
        for (let i = 0; i < points.length; i++) {
            const a = points[i]
            const b = points[(i + 1) % points.length]
            area += a.x * b.y - b.x * a.y
        }
        return area / 2
    },
    centroid(points) { //the center of area, where Matter puts a body's position
        const area = levelElements.polygonArea(points)
        let x = 0
        let y = 0
        for (let i = 0; i < points.length; i++) {
            const a = points[i]
            const b = points[(i + 1) % points.length]
            const cross = a.x * b.y - b.x * a.y
            x += (a.x + b.x) * cross
            y += (a.y + b.y) * cross
        }
        return { x: x / (6 * area), y: y / (6 * area) }
    },
    center(el) { //what vertices are written around, the centroid for shapes, the middle for rects
        return el.vertices ? { x: el.x, y: el.y } : { x: el.x + el.width / 2, y: el.y + el.height / 2 }
    },
    checkPoints(points) { //why a shape can't be made, or "" if it's fine
        const n = points.length
        if (n < 3) return "needs at least 3 vertices"
        if (n > levelElements.vertexLimit) return `can't have more than ${levelElements.vertexLimit} vertices`
        if (!points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))) return "vertices need numbers"
        const side = (a, b, c) => Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x))
        for (let i = 0; i < n; i++) { //edges that aren't next to each other can't cross
            for (let j = i + 2; j < n; j++) {
                if (i === 0 && j === n - 1) continue
                const a = points[i], b = points[(i + 1) % n], c = points[j], d = points[(j + 1) % n]
                if (side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0) return "edges can't cross"
            }
        }
        let sign = 0
        let turn = 0
        for (let i = 0; i < n; i++) {
            const a = points[i]
            const b = points[(i + 1) % n]
            const c = points[(i + 2) % n]
            const ab = { x: b.x - a.x, y: b.y - a.y }
            const bc = { x: c.x - b.x, y: c.y - b.y }
            const lengths = Math.hypot(ab.x, ab.y) * Math.hypot(bc.x, bc.y)
            if (lengths < 1) return "two vertices are in the same spot"
            const cross = ab.x * bc.y - ab.y * bc.x
            if (Math.abs(cross) > 1e-6 * lengths) { //vertices in a straight line are fine
                if (sign && Math.sign(cross) !== sign) return "has to be convex, no dents"
                sign = Math.sign(cross)
            }
            turn += Math.atan2(cross, ab.x * bc.x + ab.y * bc.y)
        }
        if (Math.abs(Math.abs(turn) - 2 * Math.PI) > 0.01) return "edges can't cross"
        if (Math.abs(levelElements.polygonArea(points)) < levelElements.minArea) return "too small"
        return ""
    },
    setPoints(el, points) { //world points to a map or block, a rect if it is one
        const isRect = points.length === 4 && points.every((p, i) => {
            const next = points[(i + 1) % 4]
            return p.x === next.x || p.y === next.y
        })
        if (isRect) {
            const b = levelElements.boundsOf(points)
            delete el.vertices
            Object.assign(el, b)
            return
        }
        const round = n => Math.round(n * 1000) / 1000
        const c = levelElements.centroid(points)
        el.x = round(c.x)
        el.y = round(c.y)
        el.vertices = points.map(p => [round(p.x - el.x), round(p.y - el.y)])
        delete el.width
        delete el.height
    },
    regularPoints(box, sides) { //a regular shape stretched to fill box, flat side down
        const unit = []
        for (let i = 0; i < sides; i++) {
            const angle = Math.PI / 2 + Math.PI / sides + 2 * Math.PI * i / sides
            unit.push({ x: Math.cos(angle), y: Math.sin(angle) })
        }
        const b = levelElements.boundsOf(unit)
        const round = n => Math.round(n * 1000) / 1000
        return unit.map(p => ({ x: round(box.x + (p.x - b.x) / b.width * box.width), y: round(box.y + (p.y - b.y) / b.height * box.height) }))
    },
    pathText(el) { //vertices around the center, written like spawn.mapVertex: "x y  x y  x y"
        const c = levelElements.center(el)
        const n = value => Number(value.toFixed(3))
        return levelElements.points(el).map(p => `${n(p.x - c.x)} ${n(p.y - c.y)}`).join("  ")
    },
    parsePath(el, text) { //pathText back to world points, or an error
        const numbers = String(text).match(/-?(\d+\.?\d*|\.\d+)(e-?\d+)?/gi) || []
        if (numbers.length % 2) return { error: "needs x y pairs" }
        const c = levelElements.center(el)
        const points = []
        for (let i = 0; i < numbers.length; i += 2) points.push({ x: c.x + Number(numbers[i]), y: c.y + Number(numbers[i + 1]) })
        return { points, error: levelElements.checkPoints(points) }
    },
    summary(el) { //short and code-like, for the editor's history, like map(0, -100, 500, 25)
        const type = levelElements.types[el.type]
        if (type && type.summary) return type.summary(el)
        const n = value => Number(Number(value).toFixed(2))
        let args
        if (el.vertices) {
            args = [n(el.x), n(el.y), `${el.vertices.length} vertices`]
        } else if (el.width !== undefined) {
            args = [el.x, el.y, el.width, el.height].map(n)
        } else {
            args = [n(el.x), n(el.y)]
        }
        return `${el.type}(${args.join(", ")})`
    },
    //*********************************************************************
    // code, each type's code(el, name) returns { setup, custom, top } lines of javascript, see levelData.code()
    // setup runs once when the level loads, name is a variable name for it like boost1, custom and top run each cycle
    //*********************************************************************
    args(...values) { //numbers without float noise, strings quoted, like they'd be written by hand
        return values.map(value => typeof value === "number" ? String(Number(value.toFixed(6))) : typeof value === "string" ? JSON.stringify(value) : value).join(", ")
    },
    marker(el, radius, fill, text) { //where a mob or power up spawns, the editor draws it with type.overlay()
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.arc(el.x, el.y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = fill
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = "rgba(0,0,0,0.5)"
        ctx.stroke()
        ctx.font = `${Math.max(16, radius * 0.5)}px monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "#000"
        ctx.fillText(text, el.x, el.y)
        ctx.textBaseline = "alphabetic"
        ctx.textAlign = "left"
    },
    area(el) {
        return el.vertices ? Matter.Vertices.area(levelElements.points(el)) : el.width * el.height
    },
}

//*********************************************************************
// core, every level has one of each
//*********************************************************************
levelElements.define("spawn", {
    group: "core",
    isSingleton: true,
    defaults: () => ({ x: 0, y: -50, bump: true }),
    props: [...levelElements.position(), levelElements.prop.bool("bump")],
    bounds: el => ({ x: el.x - 50, y: el.y - 150, width: 100, height: 200 }), //the entrance arch around the player
    build(el, options) {
        if (options.isLive) { //moving the spawn in the editor shouldn't teleport the player
            m.spawnPos.x = el.x
            m.spawnPos.y = el.y
            level.enter.x = el.x - 50
            level.enter.y = el.y + 20
        } else {
            level.setPosToSpawn(el.x, el.y)
        }
        if (el.bump) spawn.mapRect(level.enter.x, level.enter.y + 20, 100, 20)
        return { custom() { level.enter.draw() } }
    },
    code: el => ({
        setup: [`level.setPosToSpawn(${levelElements.args(el.x, el.y)});`, ...(el.bump ? ["spawn.mapRect(level.enter.x, level.enter.y + 20, 100, 20); //bump for level entrance"] : [])],
        custom: ["level.enter.draw();"],
    }),
})

levelElements.define("exit", {
    group: "core",
    isSingleton: true,
    defaults: () => ({ x: 950, y: -30, bump: true }),
    props: [...levelElements.position(), levelElements.prop.bool("bump")],
    bounds: el => ({ x: el.x, y: el.y - 170, width: 100, height: 210 }),
    build(el) {
        level.exit.x = el.x
        level.exit.y = el.y
        if (el.bump) spawn.mapRect(el.x, el.y + 20, 100, 20)
        return { custom() { level.exit.drawAndCheck() } }
    },
    code: el => ({
        setup: [`level.exit.x = ${levelElements.args(el.x)};`, `level.exit.y = ${levelElements.args(el.y)};`, ...(el.bump ? ["spawn.mapRect(level.exit.x, level.exit.y + 20, 100, 20); //bump for level exit"] : [])],
        custom: ["level.exit.drawAndCheck();"],
    }),
})

//*********************************************************************
// shapes, drawn with the editor's draw tool, a rect or a list of vertices around x, y
//*********************************************************************
levelElements.define("map", {
    group: "shape",
    color: "#444",
    defaults: () => ({ x: 0, y: 0, width: 100, height: 100, friction: 0.1, restitution: 0 }),
    props: [
        ...levelElements.rect(),
        levelElements.prop.number("friction", { step: 0.05, min: 0 }),
        levelElements.prop.number("restitution", { step: 0.1, min: 0 }),
    ],
    build(el) {
        map[map.length] = levelElements.matterBody(el, { friction: el.friction, restitution: el.restitution })
    },
    code(el) { //spawn.mapRect or spawn.mapVertex, with properties only when they aren't the defaults
        const changed = [el.friction !== 0.1 ? `friction: ${levelElements.args(el.friction)}` : "", el.restitution ? `restitution: ${levelElements.args(el.restitution)}` : ""].filter(Boolean)
        const properties = changed.length ? `, { ${changed.join(", ")} }` : ""
        const shape = el.vertices ? `spawn.mapVertex(${levelElements.args(el.x, el.y, levelElements.pathText(el))}` : `spawn.mapRect(${levelElements.args(el.x, el.y, el.width, el.height)}`
        return { setup: [`${shape}${properties});`] }
    },
})

levelElements.define("block", {
    group: "shape",
    color: "rgba(140,140,140,0.85)",
    defaults: () => ({ x: 0, y: 0, width: 50, height: 50, density: 0.001, friction: 0.05, frictionAir: 0.001, restitution: 0, chance: 1 }),
    props: [
        ...levelElements.rect(),
        levelElements.prop.number("density", { step: 0.0005, min: 0.00001 }),
        levelElements.prop.number("mass", {
            step: 1,
            min: 0.01,
            read: el => Math.round(el.density * levelElements.area(el) * 100) / 100,
            write(el, value) { el.density = value / levelElements.area(el) },
        }),
        levelElements.prop.number("friction", { step: 0.05, min: 0 }),
        levelElements.prop.number("frictionAir", { step: 0.001, min: 0 }),
        levelElements.prop.number("restitution", { step: 0.1, min: 0 }),
        levelElements.prop.number("chance", { step: 0.1, min: 0 }), //of showing up each time the level loads, like spawn.bodyRect's chance, always shows in the editor
    ],
    overlay(el) { //blocks that don't always show up are labeled with their chance
        if (el.chance >= 1) return
        const b = levelElements.bounds(el)
        ctx.font = `${Math.max(14, Math.min(40, b.height * 0.4))}px monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "rgba(0,0,0,0.6)"
        ctx.fillText(`${Math.round(el.chance * 100)}%`, b.x + b.width / 2, b.y + b.height / 2)
        ctx.textBaseline = "alphabetic"
        ctx.textAlign = "left"
    },
    build(el, options) { //like spawn.bodyRect
        if (!options.isEditor && el.chance < 1 && Math.random() >= el.chance) return
        const who = body[body.length] = levelElements.matterBody(el, { friction: el.friction, frictionAir: el.frictionAir, restitution: el.restitution })
        Matter.Body.setDensity(who, el.density)
        who.collisionFilter.category = cat.body
        who.collisionFilter.mask = cat.player | cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet
        Composite.add(engine.world, who)
        who.classType = "body"
    },
    code(el) { //spawn.bodyRect's properties default to { friction: 0.05, frictionAir: 0.001 }, spawn.bodyVertex has no defaults
        const isDefault = el.friction === 0.05 && el.frictionAir === 0.001 && !el.restitution
        const properties = `{ friction: ${levelElements.args(el.friction)}, frictionAir: ${levelElements.args(el.frictionAir)}${el.restitution ? `, restitution: ${levelElements.args(el.restitution)}` : ""} }`
        const setup = [el.vertices ?
            `spawn.bodyVertex(${levelElements.args(el.x, el.y, levelElements.pathText(el))}, ${properties});` :
            `spawn.bodyRect(${levelElements.args(el.x, el.y, el.width, el.height)}${isDefault ? "" : `, 1, ${properties}`});`]
        if (el.density !== 0.001) setup.push(`Matter.Body.setDensity(body[body.length - 1], ${levelElements.args(el.density)});`)
        if (el.chance >= 1) return { setup }
        if (setup.length === 1 && !el.vertices) { //spawn.bodyRect has a chance argument
            setup[0] = isDefault ? setup[0].replace(/\);$/, `, ${levelElements.args(el.chance)});`) : setup[0].replace(", 1, {", `, ${levelElements.args(el.chance)}, {`)
            return { setup }
        }
        return { setup: [`if (Math.random() < ${levelElements.args(el.chance)}) {`, ...setup.map(line => "    " + line), "}"] }
    },
})

//*********************************************************************
// elements, the editor's add menu
// build() returns { custom(), top() }, run each cycle under and over the player and blocks, like level.custom and level.customTopLayer
// overlay(el) draws extra guides in the editor only, like where a platform travels
//*********************************************************************
levelElements.define("boost", {
    group: "element",
    defaults: () => ({ x: 0, y: -10, launchHeight: 1000, angle: 90 }),
    props: [
        ...levelElements.position(),
        levelElements.prop.number("launchHeight", { step: 50, min: 0 }), //about how high it flings the player
        levelElements.prop.number("angle", { step: 15 }), //degrees, 90 is up
    ],
    bounds: el => ({ x: el.x - 70, y: el.y - 60, width: 240, height: 135 }),
    build(el) {
        const boost = level.boost(el.x, el.y, el.launchHeight, el.angle * Math.PI / 180)
        return { custom() { boost.query() } }
    },
    code: (el, name) => ({
        setup: [`const ${name} = level.boost(${levelElements.args(el.x, el.y, el.launchHeight)}${el.angle === 90 ? "" : `, ${levelElements.args(el.angle)} * Math.PI / 180`});`],
        custom: [`${name}.query();`],
    }),
})

levelElements.define("mover", { //conveyor belt
    group: "element",
    defaults: () => ({ x: 0, y: -25, width: 500, height: 25, speed: -6 }),
    props: [...levelElements.rect(), levelElements.prop.number("speed", { step: 1 })],
    build(el) {
        const mover = level.mover(el.x, el.y, el.width, el.height, el.speed)
        return {
            custom() { mover.push() },
            top() { mover.draw() },
        }
    },
    code: (el, name) => ({
        setup: [`const ${name} = level.mover(${levelElements.args(el.x, el.y, el.width, el.height, el.speed)});`],
        custom: [`${name}.push();`],
        top: [`${name}.draw();`],
    }),
})

levelElements.define("transport", { //platform that slides back and forth
    group: "element",
    defaults: () => ({ x: 0, y: -200, width: 300, height: 25, speed: 4, distance: 1000 }),
    props: [...levelElements.rect(), levelElements.prop.number("speed", { step: 1 }), levelElements.prop.number("distance", { isGrid: true })],
    build(el) {
        const platform = level.transport(el.x, el.y, el.width, el.height, el.speed)
        const left = el.x + el.width / 2
        const right = left + el.distance
        return {
            custom() {
                if (platform.position.x < left) {
                    platform.changeDirection(true)
                } else if (platform.position.x > right) {
                    platform.changeDirection(false)
                }
                platform.move()
            },
            top() { platform.draw() },
        }
    },
    overlay(el) {
        ctx.strokeRect(el.x, el.y, el.width + el.distance, el.height)
    },
    code(el, name) {
        const left = levelElements.args(el.x + el.width / 2)
        const right = levelElements.args(el.x + el.width / 2 + el.distance)
        return {
            setup: [`const ${name} = level.transport(${levelElements.args(el.x, el.y, el.width, el.height, el.speed)});`],
            custom: [
                `if (${name}.position.x < ${left}) { //back and forth`,
                `    ${name}.changeDirection(true)`,
                `} else if (${name}.position.x > ${right}) {`,
                `    ${name}.changeDirection(false)`,
                `}`,
                `${name}.move();`,
            ],
            top: [`${name}.draw();`],
        }
    },
})

levelElements.define("elevator", {
    group: "element",
    defaults: () => ({ x: 0, y: -25, width: 200, height: 25, travel: 500, force: 0.003, onTouch: false }),
    props: [
        ...levelElements.rect(),
        levelElements.prop.number("travel", { isGrid: true, min: 0 }), //how far up it goes
        levelElements.prop.number("force", { step: 0.0005, min: 0 }),
        levelElements.prop.bool("onTouch"),
    ],
    build(el) {
        const elevator = level.elevator(el.x, el.y, el.width, el.height, el.y - el.travel, el.force)
        return { custom() { el.onTouch ? elevator.moveOnTouch() : elevator.move() } }
    },
    overlay(el) {
        ctx.strokeRect(el.x, el.y - el.travel, el.width, el.height + el.travel)
    },
    code: (el, name) => ({
        setup: [`const ${name} = level.elevator(${levelElements.args(el.x, el.y, el.width, el.height, el.y - el.travel, el.force)});`],
        custom: [`${name}.${el.onTouch ? "moveOnTouch" : "move"}();`],
    }),
})

levelElements.define("vanish", { //platform that shrinks away after the player touches it, then comes back
    group: "element",
    defaults: () => ({ x: 0, y: -25, width: 200, height: 25, vertical: false }),
    props: [...levelElements.rect(), levelElements.prop.bool("vertical")],
    build(el) {
        const vanish = level.vanish(el.x, el.y, el.width, el.height, el.vertical)
        return { top() { vanish.query() } }
    },
    code: (el, name) => ({
        setup: [`const ${name} = level.vanish(${levelElements.args(el.x, el.y, el.width, el.height)}${el.vertical ? ", true" : ""});`],
        top: [`${name}.query();`],
    }),
})

levelElements.define("spinner", { //block pinned at its center
    group: "element",
    defaults: () => ({ x: 0, y: -300, width: 400, height: 25, density: 0.001, spin: 0, motor: 0 }),
    props: [
        ...levelElements.rect(),
        levelElements.prop.number("density", { step: 0.0005, min: 0.00001 }),
        levelElements.prop.number("spin", { step: 0.01 }), //starting angular velocity
        levelElements.prop.number("motor", { step: 0.0005 }), //keeps it turning, like level.rotor
    ],
    build(el) {
        const rotor = level.rotor(el.x, el.y, el.width, el.height, el.density, 0, 0.001, el.spin, el.motor)
        return { custom() { if (el.motor) rotor.rotate() } }
    },
    code(el, name) {
        const rotor = `level.rotor(${levelElements.args(el.x, el.y, el.width, el.height, el.density, 0, 0.001, el.spin, el.motor)});`
        return el.motor ? { setup: [`const ${name} = ${rotor}`], custom: [`${name}.rotate();`] } : { setup: [rotor] }
    },
})

levelElements.define("wind", {
    group: "element",
    defaults: () => ({ x: 0, y: -400, width: 400, height: 400, vx: 0, vy: -0.01, float: false }),
    props: [
        ...levelElements.rect(),
        levelElements.prop.number("vx", { step: 0.005 }),
        levelElements.prop.number("vy", { step: 0.005 }),
        levelElements.prop.bool("float"), //cancels gravity inside
    ],
    build(el) {
        const wind = level.wind(el.x, el.y, el.width, el.height, { x: el.vx, y: el.vy }, el.float)
        return {
            custom() { wind.draw() },
            top() { if (!m.isTimeDilated) wind.do() },
        }
    },
    code: (el, name) => ({
        setup: [`const ${name} = level.wind(${levelElements.args(el.x, el.y, el.width, el.height)}, { x: ${levelElements.args(el.vx)}, y: ${levelElements.args(el.vy)} }${el.float ? ", true" : ""});`],
        custom: [`${name}.draw();`],
        top: [`if (!m.isTimeDilated) ${name}.do();`],
    }),
})

levelElements.define("slime", { //level.hazard
    group: "element",
    defaults: () => ({ x: 0, y: -100, width: 400, height: 100, damage: 0.0025 }),
    props: [...levelElements.rect(), levelElements.prop.number("damage", { step: 0.0005, min: 0 })],
    build(el) {
        const slime = level.hazard(el.x, el.y, el.width, el.height, el.damage)
        return { custom() { slime.query() } }
    },
    code: (el, name) => ({
        setup: [`const ${name} = level.hazard(${levelElements.args(el.x, el.y, el.width, el.height, el.damage)});`],
        custom: [`${name}.query();`],
    }),
})

levelElements.define("laser", {
    group: "element",
    defaults: () => ({ x: 0, y: -300, x2: 400, y2: -300, damage: 0.12 }),
    props: [
        ...levelElements.position(),
        levelElements.prop.number("x2", { isGrid: true }),
        levelElements.prop.number("y2", { isGrid: true }),
        levelElements.prop.number("damage", { step: 0.02, min: 0 }),
    ],
    bounds(el) {
        const b = levelElements.boundsOf([{ x: el.x, y: el.y }, { x: el.x2, y: el.y2 }])
        return { x: b.x - 10, y: b.y - 10, width: b.width + 20, height: b.height + 20 }
    },
    contains(el, p) { //close to the line
        const dx = el.x2 - el.x
        const dy = el.y2 - el.y
        const t = Math.max(0, Math.min(1, ((p.x - el.x) * dx + (p.y - el.y) * dy) / (dx * dx + dy * dy || 1)))
        return Math.hypot(p.x - el.x - t * dx, p.y - el.y - t * dy) < 15
    },
    move(el, dx, dy) {
        el.x += dx
        el.y += dy
        el.x2 += dx
        el.y2 += dy
    },
    handles: el => [{ id: "start", x: el.x, y: el.y }, { id: "end", x: el.x2, y: el.y2 }],
    summary: el => `laser(${[el.x, el.y, el.x2, el.y2].map(n => Number(n.toFixed(2))).join(", ")})`,
    dragHandle(el, id, point) {
        if (id === "start") {
            el.x = point.x
            el.y = point.y
        } else {
            el.x2 = point.x
            el.y2 = point.y
        }
    },
    build(el) {
        const laser = level.laser({ x: el.x, y: el.y }, { x: el.x2, y: el.y2 }, el.damage)
        return { custom() { laser.query() } }
    },
    overlay(el) {
        ctx.beginPath()
        ctx.moveTo(el.x, el.y)
        ctx.lineTo(el.x2, el.y2)
        ctx.stroke()
    },
    code: (el, name) => ({
        setup: [`const ${name} = level.laser({ x: ${levelElements.args(el.x)}, y: ${levelElements.args(el.y)} }, { x: ${levelElements.args(el.x2)}, y: ${levelElements.args(el.y2)} }, ${levelElements.args(el.damage)});`],
        custom: [`${name}.query();`],
    }),
})

levelElements.define("decor", { //colored rect drawn behind or in front of the player, like the fillRect shading in written levels
    group: "element",
    defaults: () => ({ x: 0, y: -400, width: 400, height: 400, color: "rgba(0,0,0,0.1)", layer: "back" }),
    props: [...levelElements.rect(), levelElements.prop.text("color"), levelElements.prop.select("layer", ["back", "front"])],
    build(el) {
        const draw = () => {
            ctx.fillStyle = el.color
            ctx.fillRect(el.x, el.y, el.width, el.height)
        }
        return el.layer === "front" ? { top: draw } : { custom: draw }
    },
    code(el) {
        const lines = [`ctx.fillStyle = ${levelElements.args(el.color)};`, `ctx.fillRect(${levelElements.args(el.x, el.y, el.width, el.height)});`]
        return el.layer === "front" ? { top: lines } : { custom: lines }
    },
})

//*********************************************************************
// mobs, the editor's mobs menu, random mobs picked for the level like written levels
// they only spawn when the level loads, in the editor only after a restart with spawn on, see levelEditor.isSpawning
//*********************************************************************
levelElements.define("mobSpot", { //a place a random mob might spawn, spawn.randomMobFromArray() picks how many by the level's difficulty, like newer written levels
    group: "mob",
    label: "spots",
    defaults: () => ({ x: 0, y: -300, small: false }),
    props: [...levelElements.position(), levelElements.prop.bool("small")], //small spots get a few small mobs instead of one
    bounds: el => ({ x: el.x - 20, y: el.y - 20, width: 40, height: 40 }),
    contains: (el, p) => Math.hypot(p.x - el.x, p.y - el.y) < 20,
    overlay: el => levelElements.marker(el, 20, "rgba(255,80,80,0.2)", el.small ? "s" : "?"),
    build(el, options) {
        if (options.isSpawning) spawn.randomMobPositions.push({ x: el.x, y: el.y, isSmall: el.small }) //levelData.play() calls spawn.randomMobFromArray() after
    },
    codeAll: elements => [ //every spot goes in one list
        "spawn.randomMobPositions = [",
        ...elements.map(el => `    [${levelElements.args(el.x, el.y)}${el.small ? ", true" : ""}],`),
        "].map(([x, y, isSmall = false]) => ({ x, y, isSmall }));",
        "spawn.randomMobFromArray()",
    ],
})

levelElements.mobType = (spawnName, label, radius, fill, hasChance, text = label) => ({ //text is what the editor writes on its marker
    group: "mob",
    label,
    defaults: () => hasChance ? { x: 0, y: -300, chance: 1 } : { x: 0, y: -300 },
    props: [...levelElements.position(), ...(hasChance ? [levelElements.prop.number("chance", { step: 0.1, min: 0 })] : [])],
    bounds: el => ({ x: el.x - radius, y: el.y - radius, width: 2 * radius, height: 2 * radius }),
    contains: (el, p) => Math.hypot(p.x - el.x, p.y - el.y) < radius,
    overlay: el => levelElements.marker(el, radius, fill, text),
    build(el, options) {
        if (options.isSpawning) spawn[spawnName](el.x, el.y, ...(hasChance ? spawnName === "randomSmallMob" ? [undefined, undefined, el.chance] : [el.chance] : []))
    },
    code(el) {
        let chance = ""
        if (hasChance && spawnName !== "randomSmallMob") chance = `, ${levelElements.args(el.chance)}`
        if (hasChance && spawnName === "randomSmallMob" && el.chance !== 1) chance = `, undefined, undefined, ${levelElements.args(el.chance)}` //how many and their size are random by default
        return { setup: [`spawn.${spawnName}(${levelElements.args(el.x, el.y)}${chance});`] }
    },
})
levelElements.define("mob", levelElements.mobType("randomMob", "mob", 40, "rgba(255,80,80,0.35)", true))
levelElements.define("smallMobs", levelElements.mobType("randomSmallMob", "small mobs", 30, "rgba(255,120,80,0.35)", true, "small"))
levelElements.define("mobGroup", levelElements.mobType("randomGroup", "group", 50, "rgba(255,80,160,0.35)", true))
levelElements.bossType = (spawnName, label, radius, fill) => ({ //a boss spawns at its spot or one of its other spots, picked at random each time the level loads
    ...levelElements.mobType(spawnName, label, radius, fill, false),
    defaults: () => ({ x: 0, y: -300, spots: [] }), //spots: [[x, y], ...] other places it could spawn, the editor shows them as handles to drag
    places: el => [[el.x, el.y], ...el.spots],
    contains: (el, p) => levelElements.types[el.type].places(el).some(([x, y]) => Math.hypot(p.x - x, p.y - y) < radius),
    move(el, dx, dy, isWhole) { //dragging the boss leaves its other spots where they are, copies take them along
        el.x += dx
        el.y += dy
        if (isWhole) el.spots = el.spots.map(([x, y]) => [x + dx, y + dy])
    },
    handles: el => el.spots.map(([x, y], i) => ({ id: `spot${i}`, x, y })),
    grabHandle(el, point) { //anywhere on another spot's marker drags that spot, not just its handle
        const index = el.spots.findIndex(([x, y]) => Math.hypot(point.x - x, point.y - y) < radius)
        return index === -1 ? null : `spot${index}`
    },
    dragHandle(el, id, point) {
        el.spots[Number(id.slice(4))] = [point.x, point.y]
    },
    summary: el => `${label.replace(" ", "")}(${levelElements.args(el.x, el.y)})${el.spots.length ? ` + ${el.spots.length} spot${el.spots.length > 1 ? "s" : ""}` : ""}`,
    overlay(el) {
        el.spots.forEach(([x, y], i) => { //other spots are dashed, with a line to the main one
            ctx.setLineDash([12, 8])
            ctx.beginPath()
            ctx.moveTo(el.x, el.y)
            ctx.lineTo(x, y)
            ctx.lineWidth = 2
            ctx.strokeStyle = "rgba(160,0,60,0.4)"
            ctx.stroke()
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, 2 * Math.PI)
            ctx.fillStyle = "rgba(200,0,60,0.1)"
            ctx.fill()
            ctx.stroke()
            ctx.setLineDash([])
            ctx.font = `${Math.max(16, radius * 0.4)}px monospace`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillStyle = "rgba(0,0,0,0.6)"
            ctx.fillText(`${label} ${i + 2}`, x, y)
            ctx.textBaseline = "alphabetic"
            ctx.textAlign = "left"
        })
        levelElements.marker(el, radius, fill, el.spots.length ? `${label} 1` : label)
    },
    build(el, options) {
        if (!options.isSpawning) return
        const places = levelElements.types[el.type].places(el)
        const [x, y] = places[Math.floor(Math.random() * places.length)]
        spawn[spawnName](x, y)
    },
    code(el, name) {
        const spot = ([x, y]) => `{ x: ${levelElements.args(x)}, y: ${levelElements.args(y)} }`
        if (!el.spots.length) return { setup: [`spawn.${spawnName}(${levelElements.args(el.x, el.y)});`] }
        const places = levelElements.types[el.type].places(el)
        const pick = places.length === 2 ? `Math.random() < 0.5 ? ${spot(places[0])} : ${spot(places[1])}` : `[${places.map(spot).join(", ")}][Math.floor(Math.random() * ${places.length})]` //like written levels pick a boss spot
        return { setup: [`const ${name} = ${pick}`, `spawn.${spawnName}(${name}.x, ${name}.y);`] }
    },
})
levelElements.define("boss", levelElements.bossType("randomLevelBoss", "boss", 80, "rgba(200,0,60,0.35)"))
levelElements.define("secondaryBoss", levelElements.bossType("secondaryBossChance", "2nd boss", 70, "rgba(160,0,100,0.3)")) //only with the second boss difficulty option

//*********************************************************************
// power ups, the editor's power ups menu
//*********************************************************************
levelElements.define("powerUp", {
    group: "powerUp",
    label: "power up",
    names: ["heal", "ammo", "research", "tech", "gun", "field", "coupling", "boost"], //each gets a button in the menu
    preset: name => ({ name }),
    defaults: () => ({ x: 0, y: -100, name: "heal", count: 1 }),
    props: [
        ...levelElements.position(),
        levelElements.prop.select("name", ["heal", "ammo", "research", "tech", "gun", "field", "coupling", "boost"]),
        levelElements.prop.number("count", { step: 1, min: 1 }),
    ],
    bounds: el => ({ x: el.x - 25, y: el.y - 25, width: 50, height: 50 }),
    summary: el => `${el.name}(${levelElements.args(el.x, el.y)})${el.count > 1 ? ` × ${el.count}` : ""}`,
    overlay: el => levelElements.marker(el, 25, powerUps[el.name] ? powerUps[el.name].color : "#fff", el.count > 1 ? `${el.count}` : ""),
    build(el, options) {
        if (options.isSpawning) for (let i = 0; i < el.count; i++) powerUps.spawn(el.x + 25 * i, el.y, el.name) //25 apart, power ups in the same spot lag while they push apart
    },
    code: el => ({ setup: [el.count > 1 ? `for (let i = 0; i < ${el.count}; i++) powerUps.spawn(${levelElements.args(el.x)} + 25 * i, ${levelElements.args(el.y, el.name)});` : `powerUps.spawn(${levelElements.args(el.x, el.y, el.name)});`] }),
})

levelElements.powerUpCall = (call, label, fill) => ({ //a powerUps function that picks for the player, like the starting power ups
    group: "powerUp",
    label,
    defaults: () => ({ x: 0, y: -100 }),
    props: levelElements.position(),
    bounds: el => ({ x: el.x - 30, y: el.y - 30, width: 60, height: 60 }),
    contains: (el, p) => Math.hypot(p.x - el.x, p.y - el.y) < 30,
    overlay: el => levelElements.marker(el, 30, fill, label),
    build(el, options) {
        if (options.isSpawning) powerUps[call](el.x, el.y)
    },
    code: el => ({ setup: [`powerUps.${call}(${levelElements.args(el.x, el.y)});`] }),
})
levelElements.define("randomPowerUp", levelElements.powerUpCall("chooseRandomPowerUp", "random", "rgba(0,200,180,0.3)")) //heal or ammo
levelElements.define("startingPowerUps", levelElements.powerUpCall("spawnStartingPowerUps", "starting", "rgba(30,90,200,0.3)")) //a gun or tech early in a run

levelElements.define("debris", { //random small blocks and power ups along a line, written levels use about 16
    group: "powerUp",
    defaults: () => ({ x: 0, y: -300, width: 1000, count: 16 }),
    props: [...levelElements.position(), levelElements.prop.number("width", { isGrid: true, min: 1 }), levelElements.prop.number("count", { step: 1, min: 1 })],
    bounds: el => ({ x: el.x, y: el.y - 25, width: el.width, height: 50 }),
    handles: el => [{ id: "w", x: el.x, y: el.y }, { id: "e", x: el.x + el.width, y: el.y }],
    dragHandle(el, id, point, min) {
        const right = el.x + el.width
        if (id === "w") {
            el.x = Math.min(point.x, right - min)
            el.width = right - el.x
        } else {
            el.width = Math.max(min, point.x - el.x)
        }
    },
    summary: el => `debris(${levelElements.args(el.x, el.y, el.width, el.count)})`,
    overlay(el) {
        ctx.setLineDash([])
        ctx.fillStyle = "rgba(140,140,140,0.3)"
        ctx.fillRect(el.x, el.y - 25, el.width, 50)
        ctx.fillStyle = "#000"
        ctx.font = "20px monospace"
        ctx.textAlign = "left"
        ctx.fillText(`debris × ${el.count}`, el.x + 5, el.y + 7)
    },
    build(el, options) {
        if (options.isSpawning) spawn.debris(el.x, el.y, el.width, el.count)
    },
    code: el => ({ setup: [`spawn.debris(${levelElements.args(el.x, el.y, el.width, el.count)});`] }),
})

//settings for the whole level, in the editor's level properties menu, levelData.applySettings() uses them
levelElements.level = {
    props: [
        levelElements.prop.text("name"),
        levelElements.prop.number("zoom", { step: 100, min: 200 }), //level.defaultZoom when it's played
        levelElements.prop.color("background"),
        levelElements.prop.color("mapColor"),
        levelElements.prop.color("blockColor"),
        levelElements.prop.number("gravity", { step: 0.1, min: 0.1 }), //times normal gravity, for the player, blocks, and power ups, mobs have their own
        levelElements.prop.select("fall", ["spawn", "sky"]), //falling off the bottom sends the player back to the spawn, or keeps them falling from the sky above it
        levelElements.prop.bool("lineOfSight"), //walls block the view, like subway
    ],
    defaults: () => ({ zoom: 1400, background: "#ddd", mapColor: "#444", blockColor: "rgba(140,140,140,0.85)", gravity: 1, fall: "spawn", lineOfSight: false }),
}
