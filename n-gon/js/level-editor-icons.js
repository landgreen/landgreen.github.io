"use strict";
//the level editor's little pictures: the status bar's tool, zoom, and undo icons, the align icons, power up orbs,
//and mob pictures for mob by name and the mob and boss buttons, saved in js/level-editor-mob-pictures.js by tools/mob-pictures.js
//loads after js/level-editor.js and adds to levelEditor
Object.assign(levelEditor, {
    orb(name) { //the power up's orb from powerUps.orb, without the game's hover help, "block" is a little block, difficulty has no orb so it's a black circle like in the level
        if (name === "block") return `<span class="le-orb"><span class="le-block-icon"></span></span>`
        if (name === "difficulty") return `<span class="le-orb"><span class="le-difficulty-icon"></span></span>`
        return powerUps.orb[name] ? `<span class="le-orb">${powerUps.orb[name]().replace(/ data-help="[^"]*"/g, "")}</span>` : ""
    },
    mobExamples: { //a few of what the add menu's mob, boss, and 2nd boss buttons can spawn, drawn under them like the power up buttons' orbs
        mobSpot: ["starter", "shooter", "hopper", "spinner"],
        boss: ["hydraBoss", "powerUpBossBaby", "shooterBoss"],
        secondaryBoss: ["mantisBoss", "pentaLaserBoss", "spiderBoss"],
    },
    mobExamplesHtml(typeName) { //[ pictures ], 13 × 13 each
        const pictures = (levelEditor.mobExamples[typeName] || []).filter(name => levelEditor.mobShapes[name]).map(name => {
            const { shapes, links, orbs } = levelEditor.mobShapes[name]
            return levelEditor.mobIcon(name, shapes, links, orbs, 13, 13)
        })
        return `<span class="le-options le-mob-examples">[${pictures.join("")}]</span>`
    },
    loadMobPictures() { //the mob pictures are saved in js/level-editor-mob-pictures.js, loaded the first time the editor starts a level, never in a normal run
        if (levelEditor.mobIcons || levelEditor.isLoadingMobPictures || typeof document.createElement !== "function") return
        if (levelEditor.mobPictureData) return levelEditor.useMobPictures(levelEditor.mobPictureData)
        levelEditor.isLoadingMobPictures = true
        const script = document.createElement("script")
        script.src = "js/level-editor-mob-pictures.js"
        script.onload = () => {
            levelEditor.isLoadingMobPictures = false
            levelEditor.useMobPictures(levelEditor.mobPictureData || {})
            if (levelEditor.isActive) levelEditor.renderLeft() //mob by name and the boss buttons show them
        }
        script.onerror = () => { //no pictures, only names
            levelEditor.isLoadingMobPictures = false
            levelEditor.mobIcons = {}
        }
        document.head.appendChild(script)
    },
    useMobPictures(data) { //the saved outlines, colors, and lines for each mob, drawn as svg for mob by name, see mobIcon()
        const icons = {}
        for (const [name, saved] of Object.entries(data)) {
            const picture = {
                shapes: saved.shapes.map(shape => ({ points: shape.points.map(([x, y]) => ({ x, y })), fill: shape.fill, stroke: shape.stroke })),
                links: saved.links.map(([x1, y1, x2, y2]) => [{ x: x1, y: y1 }, { x: x2, y: y2 }]),
                orbs: saved.orbs.map(([x, y, r, fill]) => ({ x, y, r, fill })),
            }
            levelEditor.mobShapes[name] = picture
            icons[name] = levelEditor.mobExtras[name]?.icon || levelEditor.mobIcon(name, picture.shapes, picture.links, picture.orbs)
        }
        levelEditor.mobIcons = icons
    },
    collectMobPictures() { //only for tools/mob-pictures.js: spawns every mob and boss once, far away, saves what it made, then takes it all away again
        const pictures = {}
        const saved = [level, spawn, simulation, m, powerUps, tech].map(object => [object, Object.entries(object).filter(([, value]) => value === null || typeof value !== "object" && typeof value !== "function")]) //a boss could set a flag when it spawns, like a boss fight starting, these go back after
        spawn.allowShields = false //random shields would hide the mob
        const round = n => Math.round(n)
        for (const name of levelElements.mobNames()) {
            const start = levelData.mark()
            const spawned = { mob: mob.length, powerUp: powerUp.length }
            const ephemera = new Set(simulation.ephemera)
            try {
                spawn[name](0, -100000)
                const made = levelData.made(start)
                const shapes = mob.slice(spawned.mob).filter(who => !who.shield).map(who => ({
                    points: who.vertices.map(v => [round(v.x), round(v.y + 100000)]),
                    fill: who.fill,
                    stroke: who.stroke,
                }))
                const end = (body, point) => [round(body.position.x + point.x), round(body.position.y + point.y + 100000)]
                const links = made.cons.concat(made.consBB, made.constraints).filter(c => c.bodyA && c.bodyB).map(c => [...end(c.bodyA, c.pointA), ...end(c.bodyB, c.pointB)]) //tails, legs, and chains, not ends pinned to the level, a spider's are at 0, 0 until it moves
                const orbs = powerUp.slice(spawned.powerUp).map(who => [round(who.position.x), round(who.position.y + 100000), round(who.size), who.color])
                if (shapes.length) pictures[name] = { shapes, links, orbs }
            } catch (error) { } //it's only a picture
            levelData.unbuild(levelData.made(start))
            levelData.removeSpawned(spawned)
            simulation.ephemera = simulation.ephemera.filter(effect => ephemera.has(effect))
        }
        for (const [object, values] of saved) for (const [key, value] of values) object[key] = value //and allowShields
        return pictures
    },
    mobExtras: { //what a mob does that its shape doesn't show, drawn on its picture: lasers (how many), a laser sword, a sniper's sight, a sucker's dark middle
        laser: { lasers: 1 }, laserLayer: { lasers: 1 }, beamer: { lasers: 1 }, focuser: { lasers: 1 }, quadLaser: { lasers: 4 }, pentaLaserBoss: { lasers: 5 },
        laserTargetingBoss: { lasers: 1 }, laserBombingBoss: { lasers: 1 }, laserLayerBoss: { lasers: 1 },
        slasher: { sword: true }, slasher2: { sword: true }, slasher3: { sword: true }, slasher4: { sword: true }, slasher5: { sword: true }, slicer: { sword: true }, slicer5: { sword: true }, slashBoss: { sword: true },
        sniper: { sight: true }, sucker: { hole: true }, bigSucker: { hole: true },
        powerUpBoss: { nodeOrbs: true }, powerUpBossBaby: { nodeOrbs: true }, //it carries a power up at each corner
        mayflyBoss: { //its swarm of cells doesn't fit, so a cartoon mayfly: wings, a pink head, a white body that thins out, and long tail threads
            icon: `<svg class="le-mob-icon" width="26" height="16" viewBox="0 0 26 16" aria-hidden="true">
                <ellipse cx="8.5" cy="4" rx="3" ry="5.5" transform="rotate(-30 8.5 4)" fill="rgba(200,225,240,0.7)" stroke="#222" stroke-width="0.6"/>
                <ellipse cx="11.5" cy="4.5" rx="2.5" ry="4.5" transform="rotate(20 11.5 4.5)" fill="rgba(200,225,240,0.7)" stroke="#222" stroke-width="0.6"/>
                <path d="M15.5 10.5 Q20 11 25 6.5 M15.5 11 Q20 13 25.5 10.5 M15.5 11.5 Q19.5 15 25 14.5" stroke="#777" stroke-width="0.6" fill="none"/>
                ${[[14.5, 10.5, 1.3], [12.5, 10, 1.7], [10, 9.5, 2.1], [7, 9.5, 2.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#222" stroke-width="0.6"/>`).join("")}
                <circle cx="3.2" cy="9.5" r="2.3" fill="rgb(182,99,124)" stroke="#222" stroke-width="0.6"/>
            </svg>`,
        },
    },
    mobIcon(name, shapes, links = [], orbs = [], w = 26, h = 16) { //shapes are { points, fill, stroke } in world space, or { x, y, r, sides, fill } made up, it's fit into a w × h picture around the biggest
        shapes = shapes.map(shape => shape.points ? shape : { ...shape, points: Array.from({ length: shape.sides }, (_, i) => ({ x: shape.x + shape.r * Math.cos(2 * Math.PI * i / shape.sides), y: shape.y + shape.r * Math.sin(2 * Math.PI * i / shape.sides) })) })
        const boxes = shapes.map(shape => levelElements.boundsOf(shape.points))
        const mainIndex = boxes.reduce((best, b, i) => b.width * b.height > 1.5 * boxes[best].width * boxes[best].height ? i : best, 0) //the first, or a much bigger body, a spider spawns its legs first
        const main = boxes[mainIndex]
        const center = { x: main.x + main.width / 2, y: main.y + main.height / 2 }
        const size = Math.max(main.width, main.height) / 2
        const extra = levelEditor.mobExtras[name] || {}
        if (extra.nodeOrbs) { //a dot at each corner, in the colors of the power ups it spawned
            const colors = orbs.length ? orbs.map(o => o.fill) : ["rgba(255,0,255,0.6)"]
            const r = Math.max(main.width, main.height) / 9
            orbs = shapes[mainIndex].points.map((p, i) => ({ x: p.x, y: p.y, r, fill: colors[i % colors.length] }))
        }
        const lines = [] //[from, to, color, dash]
        for (let i = 0; i < (extra.lasers || 0); i++) {
            const a = 2 * Math.PI * i / extra.lasers
            lines.push([center, { x: center.x + 2.4 * size * Math.cos(a), y: center.y + 2.4 * size * Math.sin(a) }, "#f00", ""])
        }
        if (extra.sword) lines.push([center, { x: center.x + 2.6 * size, y: center.y - 0.6 * size }, "rgb(110,130,170)", ""])
        if (extra.sight) lines.push([center, { x: center.x + 3 * size, y: center.y }, "rgba(255,0,0,0.7)", "2 2"])
        const points = shapes.flatMap(shape => shape.points).concat(links.flat(), lines.flatMap(line => [line[0], line[1]]), orbs.flatMap(o => [{ x: o.x - o.r, y: o.y - o.r }, { x: o.x + o.r, y: o.y + o.r }]))
        let box = levelElements.boundsOf(points)
        const reach = 7 * size //a mob that spreads out far, like a culture, is drawn around its first part
        if (box.width > 2 * reach || box.height > 2 * reach) box = { x: center.x - reach, y: center.y - reach, width: 2 * reach, height: 2 * reach }
        const k = Math.min((w - 2) / (box.width || 1), (h - 2) / (box.height || 1))
        const ox = (w - box.width * k) / 2 - box.x * k
        const oy = (h - box.height * k) / 2 - box.y * k
        const xy = p => `${(ox + p.x * k).toFixed(1)},${(oy + p.y * k).toFixed(1)}`
        const isNone = color => !color || color === "transparent" || /^(rgba|hsla)\([^,]+,[^,]+,[^,]+,\s*0(\.0*)?\s*\)$/.test(color) //no color, or see-through
        const linkPath = links.length ? `<path d="${links.map(([a, b]) => `M${xy(a)}L${xy(b)}`).join("")}" stroke="#999" stroke-width="0.7" fill="none"/>` : ""
        const polygons = shapes.map(shape => {
            const isInvisible = isNone(shape.fill) && isNone(shape.stroke)
            return `<polygon points="${shape.points.map(xy).join(" ")}" fill="${isNone(shape.fill) ? "none" : levelEditor.escape(shape.fill)}" stroke="${isInvisible ? "#777" : "#222"}" stroke-width="${shapes.length > 8 ? 0.5 : 0.8}"${isInvisible ? ` stroke-dasharray="2 1.5"` : ""}/>`
        }).join("")
        const hole = extra.hole ? `<circle cx="${(ox + center.x * k).toFixed(1)}" cy="${(oy + center.y * k).toFixed(1)}" r="${(0.6 * size * k).toFixed(1)}" fill="#000"/>` : ""
        const lineMarks = lines.map(([a, b, color, dash]) => `<path d="M${xy(a)}L${xy(b)}" stroke="${color}" stroke-width="1.2"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`).join("")
        const orbMarks = orbs.map(o => `<circle cx="${(ox + o.x * k).toFixed(1)}" cy="${(oy + o.y * k).toFixed(1)}" r="${Math.max(1, o.r * k).toFixed(1)}" fill="${levelEditor.escape(o.fill || "#888")}"/>`).join("")
        return `<svg class="le-mob-icon" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${linkPath}${lineMarks}${polygons}${hole}${orbMarks}</svg>`
    },
    statusIcon(name) { //zoom is a magnifying glass
        const icons = {
            zoom: `<circle cx="6.5" cy="6" r="4.5" fill="#fff" stroke="#333" stroke-width="1.6"/><path d="M10 9.5 L15 13" stroke="#333" stroke-width="2.4" stroke-linecap="round"/>`,
        }
        return `<svg class="le-tool-icon le-status-icon" viewBox="0 0 17 14" width="17" height="14" aria-label="${name}">${icons[name]}</svg>`
    },
    toolIcon(tool) { //tiny drawings for the status bar's draw tools, simple enough to read from far away
        const icons = {
            select: `<rect x="4.5" y="0.5" width="8" height="13" rx="4" fill="#fff" stroke="#333"/><path d="M4.5 5.5 H12.5 M8.5 0.5 V5.5" stroke="#333"/><path d="M8.5 0.5 A4 4 0 0 0 4.5 4.5 V5.5 H8.5 Z" fill="#0cf"/>`,
            map: `<rect x="1.5" y="2" width="14" height="10" fill="${color.map}"/>`,
            block: `<rect x="2.5" y="2.5" width="12" height="9" fill="${color.block}" stroke="${color.blockS}" stroke-width="1.5"/>`,
            measure: `<rect x="0.5" y="3.5" width="16" height="7" fill="#fd4" stroke="#333"/><path d="M4.5 3.5 V6.5 M8.5 3.5 V7.5 M12.5 3.5 V6.5" stroke="#333"/>`,
            pan: `<path d="M8.5 1 L6.5 3 M8.5 1 L10.5 3 M8.5 13 L6.5 11 M8.5 13 L10.5 11 M2 7 L4 5 M2 7 L4 9 M15 7 L13 5 M15 7 L13 9 M8.5 1 V13 M2 7 H15" fill="none" stroke="#333" stroke-width="1.3" stroke-linecap="round"/>`,
        }
        return `<svg class="le-tool-icon" viewBox="0 0 17 14" width="17" height="14" aria-label="${tool}">${icons[tool]}</svg>`
    },
    arrowIcon(name) { //undo curls back to the left, redo is it mirrored, in the text color so disabled grays them
        const flip = name === "redo" ? ` transform="matrix(-1 0 0 1 16 0)"` : ""
        return `<svg class="le-tool-icon" viewBox="0 0 16 14" width="16" height="14" aria-label="${name}"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"${flip}><path d="M3.5 5 H9 A4 4 0 0 1 9 13 H6"/><path d="M6.5 2 L3.5 5 L6.5 8"/></g></svg>`
    },
    alignIcon(edge) { //bars against a line, for the inspector's align buttons
        const isX = ["left", "center", "right"].includes(edge)
        const at = { left: 2, center: 7, right: 12, top: 2, middle: 7, bottom: 12 }[edge]
        const shapes = [[3, 9], [5, 5]].map(([along, size], i) => {
            const start = edge === "left" || edge === "top" ? at : edge === "right" || edge === "bottom" ? at - size : at - size / 2
            return isX ? `<rect x="${start}" y="${along + i * 3}" width="${size}" height="2.5" fill="currentColor"/>` : `<rect x="${along + i * 3}" y="${start}" width="2.5" height="${size}" fill="currentColor"/>`
        }).join("")
        const line = isX ? `<path d="M${at} 1 V13" stroke="currentColor" stroke-width="0.8"/>` : `<path d="M1 ${at} H13" stroke="currentColor" stroke-width="0.8"/>`
        return `<svg class="le-tool-icon le-align-icon" viewBox="0 0 14 14" width="14" height="14" aria-label="align ${edge}">${line}${shapes}</svg>`
    },
})
