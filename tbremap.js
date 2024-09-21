!function() {
    const e = "__is_TB_Overridden"
      , t = DataTransfer.prototype;
    !0 !== Object.getOwnPropertyDescriptor(t, e)?.value && (Object.defineProperty(t, e, {
        value: !0,
        enumerable: !1,
        configurable: !1,
        writable: !1
    }),
    function() {
        const e = document.execCommand
          , t = Document.prototype.execCommand !== e;
        document.execCommand = function() {
            let n;
            if (n = t ? e.bind(document) : Document.prototype.execCommand.bind(document),
            "1" === document.body.dataset.__TB_execCommand) {
                document.body.dataset.__TB_execCommand_pending = "1";
                const e = arguments;
                return queueMicrotask(( () => {
                    n(...e),
                    document.body.dataset.__TB_execCommand_finished = "1"
                }
                )),
                !0
            }
            return n(...arguments)
        }
    }(),
    function() {
        const e = t
          , n = {}
          , o = e => `__TB_override-${e}`;
        ["types", "items", "getData"].forEach((t => {
            const r = Object.getOwnPropertyDescriptor(e, t)
              , c = Symbol("__" + t);
            let s;
            n[t] = c,
            Object.defineProperty(e, c, r),
            s = "types" === t || "items" === t ? {
                get() {
                    return this.__is_TB_overridden ? this[o(t)] : this[n[t]]
                }
            } : {
                value: function(...e) {
                    return this.__is_TB_overridden ? this[o(t)](...e) : this[n[t]](...e)
                },
                writable: !0
            },
            Object.defineProperty(e, t, s)
        }
        )),
        document.addEventListener("paste", (function(e) {
            if (document.body.dataset.__TB_execCommand) {
                const t = e.clipboardData;
                t.__is_TB_overridden = !0,
                t[o("types")] = e.clipboardData[n.types].slice();
                const r = new DataTransfer
                  , c = Object.create(null);
                for (const e of t[o("types")]) {
                    const o = t[n.getData](e);
                    c[e] = o,
                    r.setData(e, o)
                }
                t[o("items")] = r[n.items],
                t[o("getData")] = function(e) {
                    if (this.__is_TB_overridden && ("text" === (e = e.toLowerCase()) && (e = "text/plain"),
                    e in c)) {
                        return c[e]
                    }
                    return this[n.getData](...arguments)
                }
            }
        }
        ), !0)
    }(),
    function() {
        const e = HTMLElement.prototype
          , t = "editContext"
          , n = Object.getOwnPropertyDescriptor(e, t);
        n && Object.defineProperty(e, t, {
            configurable: !0,
            enumerable: !0,
            get() {
                return n.get.call(this)
            },
            set(e) {
                try {
                    if (e)
                        queueMicrotask(( () => {
                            const e = new CustomEvent("__TB_registerElementEvent",{
                                bubbles: !0,
                                cancelable: !1,
                                detail: {
                                    register: !0
                                }
                            });
                            this.dispatchEvent(e)
                        }
                        ));
                    else if (document.body.dataset.__TB_pasteEvent) {
                        const t = n.set.call(this, e);
                        return delete document.body.dataset.__TB_pasteEvent,
                        queueMicrotask(( () => {
                            const e = new CustomEvent("__TB_triggerPasteElementEvent",{
                                bubbles: !0,
                                cancelable: !1
                            });
                            this.dispatchEvent(e)
                        }
                        )),
                        t
                    }
                } catch (e) {
                    console.error(e)
                }
                return n.set.call(this, e)
            }
        })
    }(),
    document.addEventListener("TB_customClick", (e => {
        e.composedPath()[0].click()
    }
    )))
}();
