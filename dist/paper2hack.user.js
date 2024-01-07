// ==UserScript==
// @name         paper2hack
// @description  Modding utility/menu for paper.io
// @version      0.1.21
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
    const VERSION = "beta 0.1.21"
    let newApi
    let finish = false; // Start booting
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
    // New api loads too slow!!
    // Maybe plan in only supporting the old api? just an opinion
    (async() => {
        console.log("[paper2hack] Waiting for api");
        while(!window.hasOwnProperty("paperio2api")) // Wait till' paperio2api exists
            if (window.hasOwnProperty("paper2")) {return;} // If paper2 instead exists, return
            await new Promise(resolve => setTimeout(resolve, 1000)); // Otherwise.. wait!!
        console.log("[paper2hack] api defined!");
    })();
    window.api = {
        /**
         * Gets the configuration
         * @returns the configuration
         */
        config: function () {
            if (newApi) {
                return paperio2api.config;
            } else {
                return paper2.currentConfig;
            }
        },
        /**
         * Gets the game
         * @returns the game
         */
        game: function () {
            if (newApi) {
                return paperio2api.game
            } else {
                return paper2.game
            }
        },
        /**
         * Gets the player
         * @returns the player
         */
        player: function () {
            return this.game().player;   
        },
        /**
         * Search an unit by the name
         * If no unit is found, it will return `null`
         * If an unit is found, it will return that unit
         * If multiple names are used
         * The first one will be returned
         * @param {*} name The name to be searched for
         * @returns The unit if found, null if not
         */
        searchForUnit: function (name) {
            for (let i = 0; i < this.game().units.length; i++) {
                if (this.game().units[i].name.toLowerCase() == name.toLowerCase()) {return this.game().units[i];}
            }
            return null;
        },
        /**
         * Create a message, that will appear above the specified unit.
         * @param {*} unit The unit 
         * @param {*} text The text
         * @param {*} hexColor The color, in hex, for example : `#FF00FF`
         */
        addMessage: function (unit, text, hexColor) {
            unit.addLabel({
                "unit": undefined, // Assign to the unit
                "text": text,
                "color": hexColor
            })
        },
        /**
         * Kills the unit, by the other unit
         * @param {*} unitToKill The unit that will be killed
         * @param {*} unitToGetKill The unit that'll get the kill stat for
         */
        kill: function (unitToKill, unitToGetKill) {
            if (unitToGetKill == undefined) {unitToGetKill = this.player()}
            this.game().kill(unitToKill, unitToGetKill)
        },
        /**
         * Returns the resource located at the resource array (`a0_0x344c`)
         * This is only intended for reverse engineering
         * @param {number} res the resource, starting at `196`
         * @returns the resource, as a `string` can also be undefined
         */
        getResource: function (res) {
            return a0_0x2cc6(res);
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
        "despawnK": false,
        "speed": api.config().unitSpeed,
        "skin": "",
        "skinUnlock": () => {
            try {
                shop.btnsData.forEach(item => {
                    if (item.codeName) {
                        unlockSkin(item.codeName)
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
                api.game().paused = !paper2.game.paused;
                if (api.game().paused) {
                    console.log("[paper2hack] Paused");
                } else {
                    console.log("[paper2hack] Unpaused");
                }
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
                api.kill(obj, obj);
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
            alert(`Keyboard shortcuts:\n- Space: Pause/play\n- K: Despawn all other players`)
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
        options: {"No skin":"skin_00","Orange":"skin_20","Burger":"skin_19","Matrix":"skin_49","Green Goblin":"skin_48","Squid Game":"skin_47","Venom":"skin_46","Money Heist":"skin_45","Doge":"skin_44","Baby Yoda":"skin_43","Chess Queen":"skin_42","Impostor":"skin_41","Cyber Punk":"skin_40","Stay safe":"skin_39","Sanitizer":"skin_38","Doctor":"skin_37","COVID-19":"skin_36","Geralt":"skin_35","Batman":"skin_30","Joker":"skin_29","Pennywise":"skin_28","Reaper":"skin_27","Captain America":"skin_26","Thanos":"skin_25","Cupid":"skin_24","Snowman":"skin_23","Present":"skin_22","Christmas":"skin_21","Ladybug":"skin_18","Tank":"skin_17","Duck":"skin_16","Cake":"skin_15","Cash":"skin_14","Sushi":"skin_13","Bat":"skin_12","Heart":"skin_11","Rainbow":"skin_10","Nyan cat":"skin_01","Watermelon":"skin_02","Ghost":"skin_03","Pizza":"skin_04","Minion":"skin_05","Freddy":"skin_06","Spiderman":"skin_07","Teletubby":"skin_08","Unicorn":"skin_09","Eye":"eye", "Frankenstein":"Frank", "Santa":"santa", "Rudolph":"rudolf"}
    }).on("change", ev => {
        if (newApi && finish) {window.alert("Cannot do this in this version!");}
        // Oh boy! No player No skin!
        if (!api.game() || !api.player()) {return;}
        let id = ev.value;
        // The skin manager uses the codeName to get the skin itself
        let codeName;
	let secret = true;
        shop.btnsData.forEach(s => {
            if (s.useId == id) {
                codeName = s.codeName;
                // There is no skins with the same code name, so we can return!
                return;
            }
        })
        // Edge cases since these skins don't have use ids
        if (id == "eye")    {codeName = id;}
	else if (id == "Frank")  {codeName = id;}
	else if (id == "santa")  {codeName = id;}
	else if (id == "rudolf") {codeName = id;}
	else { secret = false; }
	// The skin manager treats the default skin as undefined
        // if we don't do this it will create an error and will not change the skin
        if (codeName == "default") {codeName = undefined;}
        // Get the skin from the code name
        let skin = api.game().skinManager.getPlayerSkin(codeName);
        // And set it to the player!
        api.player().setSkin(skin);
	if (secret) {return;}
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
        api.kill(api.player());
    })
    mods.addButton({ title: "Despawn others" }).on("click", ETC.despawnOthers)
    mods.addInput(ETC, "despawnK", { label: "Despawn Others on K" })

    // keyboard shortcuts
    // pause: Spacebar
    // kill everyone: K
    document.addEventListener("keydown", ev => {
	if (!api.player()) {return;} //If not in game, return
        if (event.key === 'k') {
            if (!ETC.despawnK) return;
            ETC.despawnOthers()
        }
        if (event.key === " ") {
            ETC.pause()
        }
    })
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
    document.querySelector(".tp-dfwv").style.zIndex = "50"; //Make sure the menu shows up over some GUI
    finish = true; // Ended booting
    let messages = this.document.querySelectorAll("#message p");
    messages.forEach((msg)=>{msg.remove();}) //Remove all messages
    ETC.newMessage(`paper2hack ${VERSION}`);
    let checkinstallmessage = ETC.newMessage('');
    checkinstallmessage.innerHTML = `<a style="color: white" href="https://github.com/stretch07/paper2hack">check/install update</a>`;
    ETC.newMessage(`have fun hacking!`);
}, false);
