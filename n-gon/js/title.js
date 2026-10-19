"use strict";
//the title page player, so people can try the controls before starting a run
//it's the real player, field emitter, and physics engine, so it moves the same as in a run
//the window edges are walls, hidden map bodies behind the title art, buttons, and open menus are platforms (data-platform in index.html)
//keys on the title art light up while held (data-key in index.html)
const titlePage = {
    isOn: false,
    startTimer: null,
    frameRequest: null, //the next animation frame, null while the loop sleeps
    then: 0,
    lastActiveTime: 0, //the loop sleeps after nothing moves or is pressed for a while, and wakes on input
    zoom: 1,
    viewSize: 1094, //map units across the window's shorter side, the title art is 800 across, at this size the top of the keys is only a jump high from on top of the block
    width: 1000, //room size in map units
    floorY: 1000,
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 }, //tracked here, simulation.mouse can be flipped by the last run's level
    blockSize: 70,
    lastPositions: new WeakMap(), //where each block was last frame, resting blocks still have a speed from gravity
    menus: new Map(), //each open menu's <details> and its platform
    queueStart(delay = 2250) { //called on the first page load and by simulation.splashReturn(), 1.25 seconds before the title art's CSS animations end at 3.5s (.fade-in in style.css)
        clearTimeout(titlePage.startTimer)
        titlePage.startTimer = setTimeout(titlePage.start, delay)
    },
    start() {
        titlePage.startTimer = null
        if (titlePage.isOn || !simulation.onTitlePage || simulation.isStartingGame || build.isExperimentSelection || m.isShipMode) return
        if (document.getElementById("splash").style.display === "none") return
        if (!matchMedia("(any-pointer: fine)").matches) return //no mouse, so probably no keyboard either
        const inGameConsole = simulation.inGameConsole
        simulation.inGameConsole = () => { } //resetting tech and setting the field print to the in-game console
        try {
            //clear what's left from the last run
            Composite.clear(engine.world, false)
            Engine.clear(engine)
            map = []
            body = []
            mob = []
            powerUp = []
            bullet = []
            cons = []
            consBB = []
            composite = []
            simulation.ephemera = []
            level.surfacePortals.length = 0
            lastTouchedBlock = null
            color = { block: "rgba(140,140,140,0.85)", blockS: "#222", map: "#444", bullet: "#000" }
            //set up the player the way simulation.startGame() does, so tech from the last run doesn't carry over
            m.spawn() //before the map, engine.js only finds the ground when the jump sensor is first in a collision pair
            tech.resetAllTech() //also resets the skin
            m.alive = false //winning the game leaves this on, and the pause key would start the game loop on the title page
            m.definePlayerMass()
            tech.healMaxEnergyBonus = 0
            m.coupling = 0
            m.fieldUpgrades[1].energyHealthRatio = 1
            m.setField(0)
            m.energy = m.maxEnergy
            m.immuneCycle = 0
            m.onGround = false
            m.crouch = false
            m.yOff = m.yOffGoal = m.yOffWhen.jump
            m.hardLandCD = 0
            powerUps.boost.endCycle = 0
            titlePage.buildRoom()
            titlePage.placePlayer()
            spawn.bodyRect(0, 0, titlePage.blockSize, titlePage.blockSize)
            titlePage.placeBlock()
            titlePage.buildMenus()
        } catch (error) {
            console.error(error)
            titlePage.isOn = true
            titlePage.stop()
            return
        } finally {
            simulation.inGameConsole = inGameConsole
        }
        //the HUD from the last run would show over the title page
        for (const id of ["guns", "field", "right-HUD", "right-HUD-constraint", "health"]) document.getElementById(id).style.display = "none"
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = "source-over"
        ctx.setLineDash([])
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        document.body.style.backgroundColor = "#e2e9ec" //the same color as #fade-out, so the page looks the same as #fade-out fades away to show the player
        document.getElementById("fade-out").style.transition = "opacity 1s" //quicker than its usual 3s
        document.getElementById("fade-out").style.opacity = 0
        titlePage.isOn = true
        titlePage.wake()
    },
    stop() { //called by simulation.startGame() before it spawns the run's player
        clearTimeout(titlePage.startTimer)
        titlePage.startTimer = null
        titlePage.releaseKeys()
        if (!titlePage.isOn) return
        titlePage.isOn = false
        cancelAnimationFrame(titlePage.frameRequest)
        titlePage.frameRequest = null
        m.drop()
        if (m.crouch) m.undoCrouch()
        m.hardLandCD = 0
        Composite.clear(engine.world, false)
        Engine.clear(engine)
        map = []
        body = []
        titlePage.menus.clear()
        simulation.ephemera = []
        document.getElementById("fade-out").style.transition = "" //back to its usual speed for the run
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    },
    buildRoom() { //the window edges are walls, the title art and buttons are platforms, run titlePage.buildMenus() after
        for (let i = 0; i < map.length; i++) Composite.remove(engine.world, map[i])
        map = []
        titlePage.menus.clear()
        titlePage.zoom = Math.min(canvas.width, canvas.height) / titlePage.viewSize
        titlePage.width = canvas.width / titlePage.zoom
        titlePage.floorY = canvas.height / titlePage.zoom //the standing player's feet are drawn down to the floor, so they're flush with the bottom edge
        const w = titlePage.width
        const h = titlePage.floorY
        const thick = 1000 //so thrown blocks can't pass through
        titlePage.addMap(Bodies.rectangle(w / 2, h + thick / 2, w + 2 * thick, thick)) //floor
        titlePage.addMap(Bodies.rectangle(-thick / 2, h / 2, thick, h)) //left wall, going up over it is the easter egg in titlePage.secretStart()
        titlePage.addMap(Bodies.rectangle(w + thick / 2, (h - 5000) / 2, thick, h + 5000)) //right wall, goes far above the window so there's no way out on the right
        for (const el of document.querySelectorAll("#splash [data-platform]")) {
            if (el.dataset.platform === "box") {
                titlePage.addBox(el.getBoundingClientRect())
                continue
            }
            const points = titlePage.outline(el)
            if (points.length < 3) continue
            const hull = Vertices.hull(points)
            const center = Vertices.centre(hull)
            titlePage.addMap(Bodies.fromVertices(center.x, center.y, [hull]))
        }
        for (const id of ["start-button", "training-button", "experiment-button", "continue-button"]) {
            const rect = document.getElementById(id).getBoundingClientRect()
            if (rect.width) titlePage.addBox(rect) //hidden buttons have no size
        }
    },
    outline(el) { //the corners of a rect, or points every 3 pixels along other shapes' outlines, in map units
        const matrix = el.getScreenCTM()
        if (!matrix) return []
        let points = []
        if (el instanceof SVGRectElement) {
            const box = el.getBBox()
            points = [new DOMPoint(box.x, box.y), new DOMPoint(box.x + box.width, box.y), new DOMPoint(box.x + box.width, box.y + box.height), new DOMPoint(box.x, box.y + box.height)]
        } else {
            const length = el.getTotalLength()
            const count = Math.min(200, Math.ceil(length * Math.hypot(matrix.a, matrix.b) / 3))
            for (let i = 0; i < count; i++) points.push(el.getPointAtLength(length * i / count))
        }
        return points.map(point => {
            const screen = point.matrixTransform(matrix)
            return { x: screen.x / titlePage.zoom, y: screen.y / titlePage.zoom }
        })
    },
    addBox(rect) { //a rectangle with slightly rounded corners, the player slides off rounder shapes
        const z = titlePage.zoom
        return titlePage.addMap(Bodies.rectangle((rect.left + rect.width / 2) / z, (rect.top + rect.height / 2) / z, rect.width / z, rect.height / z, { chamfer: { radius: 10 / z } }))
    },
    addMap(who) { //like level.addToWorld()
        who.collisionFilter.category = cat.map
        who.collisionFilter.mask = cat.player | cat.map | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet
        Matter.Body.setStatic(who, true)
        map.push(who)
        Composite.add(engine.world, who)
        return who
    },
    buildMenus() { //each open menu in the bottom left is a platform, rebuilt when it opens, closes, or changes size
        const z = titlePage.zoom
        for (const details of document.querySelectorAll("#info details")) {
            const panel = details.querySelector(".details-div")
            const rect = details.open && panel ? panel.getBoundingClientRect() : null
            const old = titlePage.menus.get(details)
            if (old) {
                if (rect && Math.abs(old.bounds.min.x - rect.left / z) + Math.abs(old.bounds.min.y - rect.top / z) + Math.abs(old.bounds.max.x - rect.right / z) + Math.abs(old.bounds.max.y - rect.bottom / z) < 1) continue //hasn't moved
                Composite.remove(engine.world, old)
                map.splice(map.indexOf(old), 1)
                titlePage.menus.delete(details)
            }
            if (rect && rect.width && rect.height) {
                const who = titlePage.addBox(rect)
                who.passThrough = 0 //collision categories it lets pass through
                titlePage.menus.set(details, who)
                //like a dropped block, a menu that opens on the player or the block doesn't hit it until it moves out
                if (Matter.Query.collides(who, [playerBody, playerHead]).some(hit => hit.depth > 2)) who.passThrough |= cat.player
                if (Matter.Query.collides(who, body).some(hit => hit.depth > 2)) who.passThrough |= cat.body | cat.bullet
                who.collisionFilter.mask &= ~who.passThrough
            }
        }
    },
    menuChanged() { //a menu opened, closed, or changed size, like updates after it loads
        if (!titlePage.isOn) return
        titlePage.buildMenus()
        titlePage.wake()
    },
    menuObserver: new ResizeObserver(() => titlePage.menuChanged()),
    updateMenus() { //a menu is solid again for the player or the block once it's out
        for (const who of titlePage.menus.values()) {
            if ((who.passThrough & cat.player) && !Matter.Query.collides(who, [playerBody, playerHead]).length) {
                who.passThrough &= ~cat.player
                who.collisionFilter.mask |= cat.player
            }
            if ((who.passThrough & cat.body) && !Matter.Query.collides(who, body).length) {
                who.passThrough &= ~(cat.body | cat.bullet)
                who.collisionFilter.mask |= cat.body | cat.bullet
            }
        }
    },
    placePlayer() { //standing under the movement keys
        const key = document.querySelector('#splash [data-key="down"]').getBoundingClientRect()
        const bottom = player.bounds.max.y - player.position.y
        Matter.Body.setPosition(player, { x: (key.left + key.width / 2) / titlePage.zoom, y: titlePage.floorY - bottom - 1 })
        Matter.Body.setVelocity(player, { x: 0, y: 0 })
    },
    placeBlock() { //on the floor between the P key and the mouse, a step up to the keys
        const p = document.querySelector('#splash [data-key="pause"]').getBoundingClientRect()
        const mouse = document.getElementById("splash-mouse").getBoundingClientRect()
        Matter.Body.setAngle(body[0], 0)
        Matter.Body.setPosition(body[0], { x: (p.right + mouse.left) / 2 / titlePage.zoom, y: titlePage.floorY - titlePage.blockSize / 2 - 1 })
        Matter.Body.setVelocity(body[0], { x: 0, y: 0 })
        Matter.Body.setAngularVelocity(body[0], 0)
    },
    isStuck(parts) { //inside a platform or outside the room
        for (const part of parts) {
            if (part.position.x < 0 || part.position.x > titlePage.width || part.position.y < 0 || part.position.y > titlePage.floorY) return true
            if (Matter.Query.collides(part, map).some(hit => hit.depth > 8)) return true
        }
        return false
    },
    loop() {
        titlePage.frameRequest = null
        if (!titlePage.isOn) return
        const now = Date.now()
        const elapsed = now - titlePage.then
        const interval = 1000 / simulation.fpsCapDefault //the same frame cap as the game loop
        if (elapsed > interval) {
            titlePage.then = now - (elapsed % interval)
            try {
                titlePage.step()
            } catch (error) { //leave the title page working without the player
                console.error(error)
                titlePage.stop()
                return
            }
            if (player.position.x < 0 && playerBody.bounds.max.y < 5) { //up over the top of the left wall, standing on it counts too
                titlePage.secretStart()
                return
            }
            if (!titlePage.isIdle()) titlePage.lastActiveTime = now
            if (now - titlePage.lastActiveTime > 2000) return //sleep, the last frame stays on the canvas
        }
        titlePage.frameRequest = requestAnimationFrame(titlePage.loop)
    },
    secretPosition: { x: -1700, y: -8000 }, //high above the initial level, with its hidden power up off to the left
    isSecretRun: false, //the initial level skips its wires, see level.maps.initial()
    async secretStart() { //easter egg, going up over the top of the left wall starts a run falling onto the roof of the initial level
        await simulation.startGame()
        if (simulation.onTitlePage) return //startGame failed
        titlePage.isSecretRun = true //set before the first frame runs level.start()
        const fade = document.getElementById("fade-out")
        fade.style.transition = "none"
        fade.style.opacity = 1 //hide the first frame, it's drawn at the normal spawn
        simulation.ephemera.push({
            name: "title secret",
            do() { //runs after level.start() builds the initial level
                simulation.removeEphemera(this)
                titlePage.isSecretRun = false
                Matter.Body.setPosition(player, titlePage.secretPosition)
                Matter.Body.setVelocity(player, { x: 0, y: 0 })
                simulation.setupCamera()
                m.resetHistory()
                fade.style.transition = "opacity 1s" //quick, the fall to the roof takes about 2 seconds
                fade.style.opacity = 0
                setTimeout(() => { fade.style.transition = "" }, 1000)
            },
        })
    },
    wake() {
        titlePage.lastActiveTime = Date.now()
        if (titlePage.isOn && titlePage.frameRequest === null) {
            titlePage.then = 0
            titlePage.frameRequest = requestAnimationFrame(titlePage.loop)
        }
    },
    step() { //like simulation.normalLoop()
        m.cycle++
        if (titlePage.isTyping()) input.reset() //typing in a text box doesn't move the player
        titlePage.updateMenus()
        simulation.gravity()
        Engine.update(engine, simulation.delta)
        if (m.onGround) {
            m.groundControl()
        } else {
            m.airControl()
        }
        m.move()
        const z = titlePage.zoom
        simulation.mouseInGame.x = titlePage.mouse.x / z
        simulation.mouseInGame.y = titlePage.mouse.y / z
        m.angle = Math.atan2(simulation.mouseInGame.y - m.pos.y, simulation.mouseInGame.x - m.pos.x)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.setTransform(z, 0, 0, z, 0, 0)
        simulation.draw.bodyDefault()
        m.draw()
        const drawRegenEnergy = m.drawRegenEnergy
        m.drawRegenEnergy = () => { } //no energy bar on the title page
        try {
            m.hold()
        } finally {
            m.drawRegenEnergy = drawRegenEnergy
        }
        m.energy = m.maxEnergy //unlimited energy on the title page
        if (!m.isHolding && (body[0].position.x < 0 || body[0].position.x > titlePage.width)) titlePage.placeBlock() //thrown up over a wall
        simulation.runEphemera()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    },
    isIdle() { //nothing is pressed or moving, and the energy bar is full
        if (input.left || input.right || input.up || input.down || input.field || input.fire) return false
        if (!m.onGround || m.isHolding || m.holdingTarget || m.energy < m.maxEnergy || simulation.ephemera.length) return false
        if (player.speed > 0.1 || m.stepSize > 0.01 || Math.abs(m.yOff - m.yOffGoal) > 0.01) return false
        let isIdle = true
        for (let i = 0; i < body.length; i++) {
            const last = titlePage.lastPositions.get(body[i])
            const now = { x: body[i].position.x, y: body[i].position.y, angle: body[i].angle }
            titlePage.lastPositions.set(body[i], now)
            if (!last || Math.abs(now.x - last.x) + Math.abs(now.y - last.y) > 0.01 || Math.abs(now.angle - last.angle) > 0.001) isIdle = false
        }
        return isIdle
    },
    isTyping() { //in a text box, or choosing a new key in the controls menu
        return !!input.focus || !!document.activeElement?.matches("input:not([type=checkbox]):not([type=radio]), textarea")
    },
    keyNames: ["up", "down", "left", "right", "fire", "field", "nextGun", "previousGun", "pause", "fullscreen"],
    keyName(code) {
        const arrows = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }
        return arrows[code] || titlePage.keyNames.find(name => input.key[name] === code)
    },
    press(name, isDown) {
        for (const el of document.querySelectorAll(`#splash [data-key="${name}"]`)) el.classList.toggle("pressed", isDown)
    },
    releaseKeys() {
        for (const el of document.querySelectorAll("#splash .pressed")) el.classList.remove("pressed")
    },
}

window.addEventListener("keydown", (event) => {
    if (!simulation.onTitlePage) return
    titlePage.wake()
    const name = titlePage.keyName(event.code)
    if (name && !titlePage.isTyping()) titlePage.press(name, true)
})
window.addEventListener("keyup", (event) => {
    if (!simulation.onTitlePage) return
    const name = titlePage.keyName(event.code)
    if (name) titlePage.press(name, false)
})
document.body.addEventListener("mousedown", (event) => {
    if (!simulation.onTitlePage) return
    titlePage.wake()
    if (event.button === 0) titlePage.press("fire", true)
    if (event.button === 2) titlePage.press("field", true)
})
document.body.addEventListener("mouseup", (event) => {
    if (event.button === 0) titlePage.press("fire", false)
    if (event.button === 2) titlePage.press("field", false)
})
document.body.addEventListener("mousemove", (event) => {
    titlePage.mouse.x = event.clientX
    titlePage.mouse.y = event.clientY
    if (titlePage.isOn) titlePage.wake()
})
window.addEventListener("blur", () => { //keys let go in another window never send keyup here
    if (!simulation.onTitlePage) return
    titlePage.releaseKeys()
    input.reset()
})
window.addEventListener("resize", () => { //window.onresize in index.js has already resized the canvas
    if (!titlePage.isOn) return
    m.drop()
    titlePage.buildRoom()
    if (titlePage.isStuck([playerBody, playerHead])) titlePage.placePlayer()
    if (body[0] && titlePage.isStuck([body[0]])) titlePage.placeBlock()
    titlePage.buildMenus()
    titlePage.wake()
})
document.getElementById("info").addEventListener("toggle", titlePage.menuChanged, true) //toggle doesn't bubble, so listen while it's captured
for (const el of document.querySelectorAll("#info .details-div")) titlePage.menuObserver.observe(el)
//a menu clicked with the mouse keeps focus, then the field key (space) would open and close it
document.addEventListener("click", (event) => {
    if (!simulation.onTitlePage || event.detail === 0) return //detail is 0 for clicks from the keyboard, they keep focus
    const el = event.target.closest?.("summary, button")
    if (el) el.blur()
})

titlePage.queueStart(Math.max(0, 2250 - performance.now())) //timed from when the page started loading, like the CSS animations
