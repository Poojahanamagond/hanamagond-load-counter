const CACHE_NAME = "hanamagond-tractor-v5";

const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./manifest.json",

    "./login.html",

    "./owner.html",

    "./owner.js",

    "./tractor.html",

    "./jcb.html",

    "./jcb.js",

    "./jcb.css",

    "./icons/icon-192.png",

    "./icons/icon-512.png"

];


self.addEventListener(

    "install",

    function (event) {

        event.waitUntil(

            caches.open(

                CACHE_NAME

            )

            .then(

                function (cache) {

                    return cache.addAll(

                        FILES_TO_CACHE

                    );

                }

            )

        );

        self.skipWaiting();

    }

);


self.addEventListener(

    "activate",

    function (event) {

        event.waitUntil(

            caches.keys()

            .then(

                function (cacheNames) {

                    return Promise.all(

                        cacheNames

                            .filter(

                                function (name) {

                                    return (

                                        name !==

                                        CACHE_NAME

                                    );

                                }

                            )

                            .map(

                                function (name) {

                                    return caches.delete(

                                        name

                                    );

                                }

                            )

                    );

                }

            )

        );

        self.clients.claim();

    }

);


self.addEventListener(

    "fetch",

    function (event) {

        if (

            event.request.method !== "GET"

        ) {

            return;

        }


        event.respondWith(

            fetch(

                event.request,

                {

                    cache: "no-store"

                }

            )

            .then(

                function (networkResponse) {

                    if (

                        networkResponse &&

                        networkResponse.status === 200 &&

                        networkResponse.type === "basic"

                    ) {

                        const responseClone =

                            networkResponse.clone();


                        caches.open(

                            CACHE_NAME

                        )

                        .then(

                            function (cache) {

                                cache.put(

                                    event.request,

                                    responseClone

                                );

                            }

                        );

                    }


                    return networkResponse;

                }

            )

            .catch(

                function () {

                    return caches.match(

                        event.request

                    );

                }

            )

        );

    }

);