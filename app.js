const mineflayer = require("mineflayer")
const vec3 = require("vec3")
const pathfinder = require('mineflayer-pathfinder').pathfinder
const ChatMessage = require("mineflayer/lib/chat_message")("1.15.2")

async function connect(loginOpts) {
    const bot = mineflayer.createBot(loginOpts)
    bot.loadPlugin(pathfinder)
    const FastBreakingMaterial = [
        1, 4, 6, 2, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 28
    ]
    const CanBreakBlock = [
        12, 28, 10, 9, 8, 191, 30, 256, 192, 490, 11, 25
    ]
    let excludeBlock = []
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
// config
    let blockStart = false
    let status = {
        blockID: 1,
        lava: true,
        lastBlock: null,
        owner: "patyhank",
        // change this ↑
        blockList: [],
        menustatus: ""
    }
    bot.once("spawn", async function () {
        console.log("Spawned")
        rl.on('line', function (line) {
            bot.chat(line)
        })
        console.log(`Username: ${bot.username}`)
    })
    bot.on("message", async function (jsonMsg) {
        const message = new ChatMessage(jsonMsg)
        console.log(message.toAnsi())
        if (message.toString() === "[S] <系統> 讀取統計資料成功.") {
            setTimeout(function () {
                fly_toggle(false)
                bot.creative.flyTo(bot.entity.position.offset(0, 0.01, 0))
            }, 3000)
        }
        let notperm = /\[S\] <領地> 您沒有 ([\s\S]+) 的許可在這裡建造\./g
        notperm = notperm.exec(message.toString())
        if (notperm) {
            setTimeout(function () {
                bot.chat("/r No Permission")
            }, 5000)
        }
        const tpaRegex = /(\[廢土伺服\] \:[\s\S]([\s\S]+)[\s\S]想要你傳送到 該玩家 的位置!)/g
        const tpamatch = tpaRegex.exec(message.toString())
        if (tpamatch && tpamatch[2] === status.owner) {
            bot.chat("/tok")
        }
        const msgRegex = /\[收到私訊 ([\s\S]+)\] : ([\s\S]+)/g
        const cmdRegex = /\[收到私訊 ([\s\S]+)\] : (\S+)\s([\s\S]+)/g
        const msgresult = msgRegex.exec(message.toString())
        const cmdresult = cmdRegex.exec(message.toString())

        if (msgresult) {
            if (msgresult[1] === status.owner) {
                if (cmdresult) {
                    const args = cmdresult[3].split(" ")
                    switch (cmdresult[2]) {
                        case "digchunk":
                            console.log(args[0])
                            await digChunk(args[0], "dig")
                            break
                    }
                } else {
                    switch (msgresult[2]) {
                        case "digchunk":
                            excludeBlock = []
                            await digChunk()
                            break
                    }
                }
            } else {
                switch (msgresult[2]) {
                    case "flytime":
                        const header = bot.tablist.header
                        const flytime = header["text"].split("\n")[5].toString().replace(/§([a-f0-9k-or])/g, "").substr(9).split(" (")[0]
                        console.log(flytime)
                        await bot.chat(`/m ${msgresult[1].toLowerCase()} ${flytime} 飛行狀態: ${!bot.player.entity.onGround}`)
                        break
                }
            }
        }

    });
    bot.on("kicked", function (reason, loggedIn) {
        console.log(`Kicked Reason: ${reason}. \nLogged In?: ${loggedIn}.`)
        connect()
    })
    bot.on("windowOpen", function (vehicle) {
        console.log(vehicle.title)
        const Windowtitle = JSON.parse(vehicle.title)
        switch (Windowtitle["text"]) {
            case "§8歡迎 ! 點擊蘋果，同意以下規範後繼續 ":
                bot.clickWindow(31, 0, 0, err => {
                    console.log(err)
                })
                console.log("Server is Showing the Rules")
                break
            case "§8只差一步，就能送出訊息了!":
                bot.clickWindow(29, 0, 0, err => {
                    console.log(err)
                })
                break
            case "§8嘿，你正取用他人物品喔。跟您確認件事 ... ":
                bot.clickWindow(29, 0, 0, err => {
                    console.log(err)
                })
                break
            case "§8[+] 個人服務相關 [+] §8↓點羊毛可切分頁↓":
                switch (status.menustatus) {
                    case "breakbedrock":
                        bot.clickWindow(51, 0, 0, err => {
                            console.log(err)
                        })
                        setTimeout(function () {
                            bot.clickWindow(24, 0, 0, err => {
                                console.log(err)
                            })
                        }, 1000)
                        break
                }
                break
            case "§2[+] 個人設定區 - 領地 [+]":
                bot.clickWindow(24, 0, 0, err => {
                    console.log(err)
                })
                break
        }
    })
    bot.on("death", function () {
        console.log("death")
        setTimeout(function () {
            bot.chat("/back")
        }, 3000)

    })

    async function openShulkerBox() {
        const block = bot.findBlock({
            point: vec3(2540, 83, -614),
            matching: 501
        })
        await bot.openChest(block)
        bot.once("windowOpen", async function (window) {
            console.log(window.id)
            console.log("open")
            await bot._client.write("window_click", {
                windowId: window.id,
                slot: 1,
                mouseButton: 1,
                action: 1,
                mode: 4,
                item: 0x00
            })
            await bot._client.write("close_window", {
                windowId: window.id
            })
        })
    }
    function fly_toggle(fly, leak_fly) {
        let flag;
        if (leak_fly === undefined || leak_fly === null) {
            leak_fly = true
        }
        if (fly === undefined || fly === null) {
            if (bot.player.entity.onGround) {
                flag = 2
            } else {
                flag = 4
            }
        } else {
            if (fly) {
                flag = 2
            } else {
                flag = 4
            }
        }
        bot._client.write("abilities", {
            flags: flag,
            flyingSpeed: 1.0,
            walkingSpeed: 1.0
        })
        if (leak_fly) {
            bot.creative.startFlying()
        } else {
            bot.creative.stopFlying()
        }
    }
    async function digChunk(pos) {
        blockStart = true
        bot.entity.position = vec3(parseFloat(bot.entity.position.x), parseFloat(bot.entity.position.y), parseFloat(bot.entity.position.z))
        let location = new mineflayer.Location(bot.player.entity.position)
        location.chunkCorner.offset(0, 0, 1)
        console.log(location.chunkCorner)
        console.log(bot.entity.position)
        // await getTools(status.nuker.tools.pickaxe , 543)
        const getY = function (y) {
            switch (pos) {
                case "60+":
                    return (y >= 60)
                case "60-":
                    return (y >= 0 && y < 60)
                case "all":
                default:
                    return (y >= 0)
            }
        }
        const blocks = function () {
            const bloak = []
            console.log(location.chunkCorner.x)
            const lx = parseInt(location.chunkCorner.x)
            const ly = parseInt(bot.player.entity.position.y)
            const lz = parseInt(location.chunkCorner.z)
            const tx = lx + 16
            const tz = lz + 16
            console.log(tx, tz)
            for (let x = lx; x < tx; x++) {
                bloak.push(vec3(x, ly, lz))
                for (let z = lz; z < tz; z++) {
                    bloak.push(vec3(x, ly, z))
                    for (let y = ly; getY(y); y--) {
                        bloak.push(vec3(x, y, z))
                    }
                }
            }
            return bloak
        }
        const b = blocks()
        console.log(b[0])
        b.sort((a, b) => (b.y - a.y || b.x - a.x));
        // console.log(b)
        console.log(`${b.length} blocks`)
        status.blockList = b
        await dig()
    }

    async function breakbedrock() {
        status.menustatus = "breakbedrock"
        bot.chat("/menu")
    }

    async function dig() {
        const breakList = (value) => {
            return (value.type !== 0 && value.type !== 617 && value.type !== 182 && !excludeBlock.includes(value.type))
        }
        if (!serverRestart || serverRestart) {
            const fly = status.blockList[0]
            let block = bot.findBlock({
                point: fly,
                matching: breakList
            })
            if (block && status.blockList.length !== 0) {
                if (!block.position.equals(fly)) {
                    if (status.blockList.length > 0) {
                        console.log(`Detected: ${fly} is Null - 2`)
                        status.blockList.shift()
                        await dig()
                    } else {
                        await bot.chat("/r 已完成")
                    }
                } else {
                    async function destroyBlockwithFastBreak() {

                        setTimeout(async function () {
                            await bot.creative.flyTo(block.position.offset(0.5, 1, 0.5), async () => {
                                await bot.setQuickBarSlot(1)
                                fly_toggle(true, true)
                                console.log(`FastBreaking ${block.position.toString()}`)
                                await bot._client.write("block_dig", {
                                    status: 0,
                                    location: {
                                        x: block.position.x,
                                        y: block.position.y,
                                        z: block.position.z,
                                    },
                                    face: 1
                                })
                                // await bot.dig(block)
                                await bot._client.write("block_dig", {
                                    status: 2,
                                    location: {
                                        x: block.position.x,
                                        y: block.position.y,
                                        z: block.position.z,
                                    },
                                    face: 1
                                })
                                // fly_toggle(true, true)
                                fly_toggle(false, true)
                                status.lastBlock = fly

                                bot.emit("break")
                            })
                        }, 20)
                    }

                    async function destroyBlockwithTool() {
                        console.log(block.harvestTools)
                        for (let harvest in block.harvestTools) {
                            console.log(harvest)
                            const index = bot.inventory.items().find((item) => item.type === parseInt(harvest))
                            if (index) {
                                await bot._client.write("window_click", {
                                    windowId: 0,
                                    slot: index.slot,
                                    mouseButton: 0,
                                    action: 1,
                                    mode: 2,
                                    item: 0x00
                                })
                                console.log(index, "window click")
                                await bot.setQuickBarSlot(0)
                                break
                            }
                        }
                        await bot.creative.flyTo(block.position.offset(0.5, 1, 0.5), async () => {
                            console.log(`Dig Block ${block.position.toString()}`)
                            await bot._client.write("block_dig", {
                                status: 0,
                                location: {
                                    x: block.position.x,
                                    y: block.position.y,
                                    z: block.position.z,
                                },
                                face: 1
                            })
                            await bot._client.write("block_dig", {
                                status: 2,
                                location: {
                                    x: block.position.x,
                                    y: block.position.y,
                                    z: block.position.z,
                                },
                                face: 1
                            })
                        })
                    }
                    console.log(status.lastBlock)
                    await normal()
                    async function normal() {
                        if (block.type === 0 || block.type === 617 || block.type === 26 || block.type === 27 || (block.material === "plant" && block.boundingBox === "empty")) {
                            bot.emit("break")
                        } else {
                            if (block.position.y >= 60) {
                                if (FastBreakingMaterial.indexOf(block.type) !== -1 && bot.inventory.items().findIndex((item) => {
                                    return (item.type === block.type)
                                }) !== -1) {
                                    // setTimeout(async function () {
                                    await destroyBlockwithFastBreak()
                                    // }, 30)
                                } else {
                                    if (CanBreakBlock.indexOf(block.type) !== -1) {
                                        // setTimeout(async function () {
                                        await destroyBlockwithFastBreak()
                                        // }, 30)
                                    } else {
                                        await destroyBlockwithTool()
                                    }

                                }
                            } else {
                                if (block.type === 25) {
                                    await destroyBlockwithFastBreak()
                                } else {
                                    await destroyBlockwithTool()
                                }
                            }
                        }
                    }
                }

            } else {
                if (status.blockList.length === 0) {
                    await bot.chat("/r 已完成")
                } else {
                    status.blockList.shift()
                    await dig()
                }
            }
        }
    }
    bot.on("break", async function () {
        status.blockList.shift()
        await dig()
    })
}

connect({
    host: "sg.mcfallout.net",
    port: 25565,
    username: "",
    password: "",
    version: false
})
