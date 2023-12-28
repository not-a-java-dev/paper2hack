// ==UserScript==
// @name         paper2hack
// @description  Modding utility/menu for paper.io
// @version      0.1.16
// @author       its-pablo
// @match        https://paper-io.com
// @match        https://paper-io.com/teams/
// @match        https://paper-io.com/battleroyale/
// @match        https://paperanimals.io
// @match        https://amogus.io
// @require      https://cdn.jsdelivr.net/npm/tweakpane@3.1.4/dist/tweakpane.min.js
// @license      GPL-3.0-only
// @icon         https://paper-io.com/favicon.ico
// @grant        none
// ==/UserScript==
adblock = () => false //this detects if adblock is on, we make it always return false so that the impostor skin loads
window.addEventListener('load', function () {
    "use strict";
    const VERSION = "beta 0.1.16"
    let newApi
    if (typeof(paper2) == "undefined") { // if paper2 does not exist (its undefined), it means we are in the new api
        newApi = true;
    } else {
        newApi = false;
    }
    if (newApi) {
        console.log("[paper2hack] USING NEW API")
    } else {
        console.log("[paper2hack] USING OLD API")
    }
    window.api = {
        config: function () {
            if (newApi) {
                return paperio2api.config
            } else {
                return paper2.currentConfig
            }
        },
        game: function () {
            if (newApi) {
                return paperio2api.game
            } else {
                return paper2.game
            }
        }
    }
    let ETC = {
        "newMessage":function (message) {
            let newMessage = document.createElement("p");
            document.querySelectorAll("#message")[1].appendChild(newMessage);
            newMessage.innerText = message;
            // Return the new message, if you need it
            return newMessage;
        },
        "reset": function () { alert("Cannot be done with tweakpane!\nTry clearing site data.") },
        "zoomScroll": false,
        "debugging": false,
        "map": false,
        "speed": api.config().unitSpeed,
        "skin": "",
        "skinUnlock": () => {
            try {
                shop.btnsData.forEach(item => {
                    if (item.unlockName) {
                        unlockSkin(item.unlockName)
                    }
                })
                console.log("[paper2hack] skins unlocked!")
            } catch (e) {
                console.log("[paper2hack] Error unlocking skins!", e)
            }
        },
        "_skins": [],
        "pause": function () {
            if (!newApi) {
                // Toggle between paused and unpaused
                // This is not possible in the new api (I believe)
                paper2.game.paused = !paper2.game.paused;
                // Return so the unit speed doesn't change
                return;
            }
            if (api.config().unitSpeed !== 0) {
                api.config().unitSpeed = 0
                console.log("[paper2hack] Paused")
            } else {
                api.config().unitSpeed = 90
                console.log("[paper2hack] Unpaused")
            }
            return;
        },
        "despawnOthers": function () {
            // Array where we store the units to kill
            let unitkills = [];
            for (let i = 0; i < api.game().units.length; i++) {
                if (api.game().units[i].isPlayer) {continue;} // Ignore if we get the player unit
                unitkills.push(api.game().units[i]);
            }
            // Iterate through the units that we're going to kill
            unitkills.forEach((obj) => {
                api.game().kill(obj, obj);
            })
        },
        "help": function () {
            alert(`
            paper2hack ${VERSION} written by stretch07 and contributors.\n\n
            https://github.com/stretch07/paper2hack \n
            Issues? https://github.com/stretch07/paper2hack/issues

            If you encounter any issues with paper2hack, refresh the page, hit the 'Reset' button, or uninstall/reinstall the mod. As a last resort, try clearing site data.
        `)
        },
        "keysList": function () {
            alert(`
            None for the moment!\n
            Stay tuned...
        `)
        },
        "openGithub": function () {
            window.open("https://github.com/stretch07/paper2hack", '_blank').focus();
        }
    }
    if (!newApi) {
        shop?.btnsData.forEach(i => {
            if (i.useId === Cookies.get('skin')) {
                ETC.skin = i.name
            }
        })
        shop?.btnsData.forEach(i => { ETC._skins.push(i.name) })
    }
    function scrollE(e) {
        if (e.deltaY > 0) {
            if (api.config().maxScale > 0.45) {
                api.config().maxScale -= 0.2
            }
        } else if (e.deltaY < 0) {
            if (api.config().maxScale < 4.5) {
                api.config().maxScale += 0.2
            }
        }
    }

    let pane = new Tweakpane.Pane({ title: "paper2hack"})
    let mods = pane.addFolder({ title: "Mods" })
    mods.addInput(ETC, "speed", { min: 5, max: 500, count: 5 }).on("change", ev => {
        api.config().unitSpeed = ev.value;
    })
    mods.addInput(ETC, "skin", {
        label: "Skin",
        // Yeah unreadable i know
        // Got this with a simple js trick ;)
        options: {"No skin":"skin_00","Orange":"skin_20","Burger":"skin_19","Matrix":"skin_49","Green Goblin":"skin_48","Squid Game":"skin_47","Venom":"skin_46","Money Heist":"skin_45","Doge":"skin_44","Baby Yoda":"skin_43","Chess Queen":"skin_42","Impostor":"skin_41","Cyber Punk":"skin_40","Stay safe":"skin_39","Sanitizer":"skin_38","Doctor":"skin_37","COVID-19":"skin_36","Geralt":"skin_35","Batman":"skin_30","Joker":"skin_29","Pennywise":"skin_28","Reaper":"skin_27","Captain America":"skin_26","Thanos":"skin_25","Cupid":"skin_24","Snowman":"skin_23","Present":"skin_22","Christmas":"skin_21","Ladybug":"skin_18","Tank":"skin_17","Duck":"skin_16","Cake":"skin_15","Cash":"skin_14","Sushi":"skin_13","Bat":"skin_12","Heart":"skin_11","Rainbow":"skin_10","Nyan cat":"skin_01","Watermelon":"skin_02","Ghost":"skin_03","Pizza":"skin_04","Minion":"skin_05","Freddy":"skin_06","Spiderman":"skin_07","Teletubby":"skin_08","Unicorn":"skin_09"}
    }).on("change", ev => {
        // Oh boy! No player No skin!
        if (!api.game() || !api.game().player) {return;}
        let id = ev.value;
        // The skin manager uses the codeName to get the skin itself
        let codeName;
        shop.btnsData.forEach(s => {
            if (s.useId == id) {
                codeName = s.codeName;
            }
        })
        // The skin manager treats the default skin as undefined
        // if we don't do this it will create an error and will not change the skin
        if (codeName == "default") {codeName = undefined;}
        // Get the skin from the code name
        let skin = api.game().skinManager.getPlayerSkin(codeName);
        // And set it to the player!
        api.game().player.setSkin(skin);
        shop.chosenSkin = id;
        Cookies.set('skin', id);
    })
    mods.addInput(ETC, "debugging", { label: "Debug" }).on("change", ev => {
        api.game().debug = ev.value
        api.game().debugGraph = ev.value
    })
    mods.addInput(ETC, "map", { label: "Map"}).on("change", ev => {
        api.game().debugView = ev.value;
    })
    mods.addButton({ title: "Pause/Play" }).on("click", ETC.pause)
    if (!newApi) {
        mods.addButton({ title: "Unlock skins", }).on("click", ETC.skinUnlock)
    }
    mods.addButton({ title: "I give up" }).on("click",() => {
        api.game().kill(api.game().player);
    })
    mods.addButton({ title: "Despawn others" }).on("click", ETC.despawnOthers)
    mods.addInput(ETC, "zoomScroll", { label: "Scroll to Zoom" }).on("change", ev => {
        if (ev.value === true) {
            window.addEventListener("wheel", scrollE)
        } else {
            window.removeEventListener("wheel", scrollE)
        }
    })
    mods.addButton({ title: "Reset" }).on('click', ETC.reset);
    let about = pane.addFolder({ title: "About", expanded: false });
    about.addButton({ title: "Help" }).on("click", ETC.help);
    about.addButton({ title: "Keyboard Shortcuts" }).on("click", ETC.keysList);
    about.addButton({ title: "GitHub" }).on("click", ETC.openGithub);
    /*Last things*/
    if (!localStorage.getItem('paper2hack')) {
        this.localStorage.setItem('paper2hack', JSON.stringify({}))
    }
    pane.importPreset(JSON.parse(localStorage.getItem("paper2hack")))
    pane.on("change", e => {
        localStorage.setItem("paper2hack", JSON.stringify(pane.exportPreset()))
    })
    let messages = this.document.querySelectorAll("#message p");
    messages.forEach((msg)=>{msg.remove();}) //Remove all messages
    ETC.newMessage(`paper2hack ${VERSION}`);
    let checkinstallmessage = ETC.newMessage('');
    checkinstallmessage.innerHTML = `<a style="color: white" href="https://github.com/stretch07/paper2hack">check/install update</a>`;
    ETC.newMessage(`have fun hacking!`);
}, false);
