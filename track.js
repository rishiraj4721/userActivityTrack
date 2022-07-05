const pluginTwo = {
    name: 'actionTrack',
    page: ({ payload }) => {
        console.log('page view fired', payload)
    },
    identify: ({ payload }) => {
        console.log("user", payload)
    },
    track: ({ }) => {
        //
    },
    // Custom functions to expose to analytics instance
    methods: {
        getstate(interactor) {
            console.log("interactor", interactor)
        },
        cookieBanner() {
            const cname = "dt-identifier";
            let name = cname + "=";
            let ca = document.cookie.split(';');
            let user = ""
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    user = c.substring(name.length, c.length);
                }
            }
            if (user != "") {
                // alert("Welcome again " + user);
            } else {
                user = 'user' + Math.floor(Math.random() * 2 ** 32);
                if (user != "" && user != null) {
                    // setCookie("dt-identifier", user, 365);
                    const d = new Date();
                    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                    let expires = "expires=" + d.toUTCString();
                    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
                }
            }
            return user;
        },

    }
}
var Interactor = function (config) {
    // Call Initialization on Interactor Call
    this.__init__(config);
};

Interactor.prototype = {
    __init__: function (config) {
        var interactor = this;
        interactor.interactions = config.interactions,
            interactor.basicInteractionElement = ['BUTTON', 'A'],
            interactor.newInteractionElementTag = config.interactionElementTag,
            interactor.newInteractionElementId = config.interactionElementId,
            interactor.interactionEvents = config.interactionEvents,
            interactor.endpoint = config.endpoint,
            interactor.async = config.async,
            interactor.debug = config.debug,
            interactor.records = [],
            interactor.session = {},
            interactor.loadTime = new Date(),
            interactor.user = config.userid;
        // Initialize Session
        interactor.__initializeSession__();
        // Call Event Binding Method
        interactor.__bindEvents__();

        return interactor;
    },
    __initializeSession__: function () {
        var interactor = this;

        // Assign Session Property
        interactor.session = {
            loadTime: interactor.loadTime,
            unloadTime: new Date(),
            language: window.navigator.language,
            platform: window.navigator.platform,
            port: window.location.port,
            clientStart: {
                name: window.navigator.appVersion,
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight
            },
            page: {
                location: window.location.pathname,
                href: window.location.href,
                origin: window.location.origin,
                title: document.title
            },
            endpoint: interactor.endpoint,
            user: interactor.user
        };

        return interactor;
    },
    __bindEvents__: function () {

        var interactor = this;

        // Set Interaction Capture
        if (interactor.interactions === true) {
            for (var i = 0; i < interactor.interactionEvents.length; i++) {
                document.querySelector('body').addEventListener(interactor.interactionEvents[i], function (e) {
                    e.stopPropagation();
                    for (var j = 0; j < interactor.basicInteractionElement.length; j++) {
                        // console.log(e.target.nodeName);
                        if (e.target.nodeName === interactor.basicInteractionElement[j]) {
                            interactor.__addInteraction__(e, interactor.basicInteractionElement[j]);
                        }
                    }
                    for (var j = 0; j < interactor.newInteractionElementId.length; j++) {
                        if (e.target.classList.value === interactor.newInteractionElementId[j]) {
                            interactor.__addInteraction__(e, interactor.newInteractionElementId[j]);
                        }
                    }
                    for (var j = 0; j < interactor.newInteractionElementTag.length; j++) {
                        if (e.target.nodeName === interactor.newInteractionElementTag[j]) {
                            interactor.__addInteraction__(e, interactor.newInteractionElementTag[j]);
                        }
                    }
                });
            }
        }

        window.onbeforeunload = function (e) {
            interactor.__sendInteractions__();
        };

        return interactor
    },
    __addInteraction__: function (e, type) {

        var interactor = this,

            // Interaction Object
            interaction = {
                type: type,
                event: e.type,
                targetTag: e.target.nodeName,
                targetClasses: e.target.className,
                content: e.target.innerText,
                clientPosition: {
                    x: e.clientX,
                    y: e.clientY
                },
                screenPosition: {
                    x: e.screenX,
                    y: e.screenY
                },
                createdAt: new Date()
            };

        // Insert into Records Array
        interactor.records.push(interaction);

        // Log Interaction if Debugging
        if (interactor.debug) {
            // Close Session & Log to Console
            interactor.__closeSession__();
            console.log("Session:\n", interactor);
        }

        return interactor;
    },
    __closeSession__: function () {
        var interactor = this;

        // Assign Session Properties
        interactor.session.unloadTime = new Date();
        interactor.session.interactions = interactor.records;
        interactor.session.clientEnd = {
            name: window.navigator.appVersion,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight
        };

        // console.log("close session")
        return interactor;
    },
    __sendInteractions__: function () {
        var interactor = this,
            // Initialize Cross Header Request
            xhr = new XMLHttpRequest();

        // Close Session
        interactor.__closeSession__();

        // Post Session Data Serialized as JSON
        xhr.open('POST', interactor.endpoint, interactor.async);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(JSON.stringify(interactor.session));

        console.log("send interactions")
        return interactor;
    }
}