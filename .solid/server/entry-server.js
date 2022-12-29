import { renderToStringAsync, isServer, createComponent, spread, delegateEvents, ssr, ssrHydrationKey, escape, useAssets, ssrAttribute, HydrationScript, NoHydration, ssrElement } from 'solid-js/web';
import { createContext, sharedConfig, createUniqueId, useContext, createRenderEffect, onCleanup, createSignal, getOwner, runWithOwner, createMemo, createComponent as createComponent$1, untrack, on, startTransition, resetErrorBoundaries, children, createRoot, Show, createResource, ErrorBoundary as ErrorBoundary$1, createEffect, For, Suspense } from 'solid-js';
import { createStore, unwrap, reconcile } from 'solid-js/store';
import cookie, { parse } from 'cookie';
import clsx from 'clsx';
import 'isomorphic-fetch';

const FETCH_EVENT = "$FETCH";

function getRouteMatches$1(routes, path, method) {
  const segments = path.split("/").filter(Boolean);
  routeLoop:
    for (const route of routes) {
      const matchSegments = route.matchSegments;
      if (segments.length < matchSegments.length || !route.wildcard && segments.length > matchSegments.length) {
        continue;
      }
      for (let index = 0; index < matchSegments.length; index++) {
        const match = matchSegments[index];
        if (!match) {
          continue;
        }
        if (segments[index] !== match) {
          continue routeLoop;
        }
      }
      const handler = route[method];
      if (handler === "skip" || handler === void 0) {
        return;
      }
      const params = {};
      for (const { type, name, index } of route.params) {
        if (type === ":") {
          params[name] = segments[index];
        } else {
          params[name] = segments.slice(index).join("/");
        }
      }
      return { handler, params };
    }
}

let apiRoutes$1;
const registerApiRoutes = (routes) => {
  apiRoutes$1 = routes;
};
async function internalFetch(route, init) {
  if (route.startsWith("http")) {
    return await fetch(route, init);
  }
  let url = new URL(route, "http://internal");
  const request = new Request(url.href, init);
  const handler = getRouteMatches$1(apiRoutes$1, url.pathname, request.method.toUpperCase());
  if (!handler) {
    throw new Error(`No handler found for ${request.method} ${request.url}`);
  }
  let apiEvent = Object.freeze({
    request,
    params: handler.params,
    env: {},
    $type: FETCH_EVENT,
    fetch: internalFetch
  });
  const response = await handler.handler(apiEvent);
  return response;
}

const XSolidStartLocationHeader = "x-solidstart-location";
const LocationHeader = "Location";
const ContentTypeHeader = "content-type";
const XSolidStartResponseTypeHeader = "x-solidstart-response-type";
const XSolidStartContentTypeHeader = "x-solidstart-content-type";
const XSolidStartOrigin = "x-solidstart-origin";
const JSONResponseType = "application/json";
function json(data, init = {}) {
  let responseInit = init;
  if (typeof init === "number") {
    responseInit = { status: init };
  }
  let headers = new Headers(responseInit.headers);
  if (!headers.has(ContentTypeHeader)) {
    headers.set(ContentTypeHeader, "application/json; charset=utf-8");
  }
  const response = new Response(JSON.stringify(data), {
    ...responseInit,
    headers
  });
  return response;
}
function redirect(url, init = 302) {
  let responseInit = init;
  if (typeof responseInit === "number") {
    responseInit = { status: responseInit };
  } else if (typeof responseInit.status === "undefined") {
    responseInit.status = 302;
  }
  if (url === "") {
    url = "/";
  }
  let headers = new Headers(responseInit.headers);
  headers.set(LocationHeader, url);
  const response = new Response(null, {
    ...responseInit,
    headers
  });
  return response;
}
const redirectStatusCodes = /* @__PURE__ */ new Set([204, 301, 302, 303, 307, 308]);
function isRedirectResponse(response) {
  return response && response instanceof Response && redirectStatusCodes.has(response.status);
}
class ResponseError extends Error {
  status;
  headers;
  name = "ResponseError";
  ok;
  statusText;
  redirected;
  url;
  constructor(response) {
    let message = JSON.stringify({
      $type: "response",
      status: response.status,
      message: response.statusText,
      headers: [...response.headers.entries()]
    });
    super(message);
    this.status = response.status;
    this.headers = new Map([...response.headers.entries()]);
    this.url = response.url;
    this.ok = response.ok;
    this.statusText = response.statusText;
    this.redirected = response.redirected;
    this.bodyUsed = false;
    this.type = response.type;
    this.response = () => response;
  }
  response;
  type;
  clone() {
    return this.response();
  }
  get body() {
    return this.response().body;
  }
  bodyUsed;
  async arrayBuffer() {
    return await this.response().arrayBuffer();
  }
  async blob() {
    return await this.response().blob();
  }
  async formData() {
    return await this.response().formData();
  }
  async text() {
    return await this.response().text();
  }
  async json() {
    return await this.response().json();
  }
}

function renderAsync(fn, options) {
  return () => async (event) => {
    let pageEvent = createPageEvent(event);
    let markup = await renderToStringAsync(() => fn(pageEvent), options);
    if (pageEvent.routerContext && pageEvent.routerContext.url) {
      return redirect(pageEvent.routerContext.url, {
        headers: pageEvent.responseHeaders
      });
    }
    markup = handleIslandsRouting(pageEvent, markup);
    return new Response(markup, {
      status: pageEvent.getStatusCode(),
      headers: pageEvent.responseHeaders
    });
  };
}
function createPageEvent(event) {
  let responseHeaders = new Headers({
    "Content-Type": "text/html"
  });
  const prevPath = event.request.headers.get("x-solid-referrer");
  let statusCode = 200;
  function setStatusCode(code) {
    statusCode = code;
  }
  function getStatusCode() {
    return statusCode;
  }
  const pageEvent = Object.freeze({
    request: event.request,
    prevUrl: prevPath || "",
    routerContext: {},
    tags: [],
    env: event.env,
    $type: FETCH_EVENT,
    responseHeaders,
    setStatusCode,
    getStatusCode,
    fetch: internalFetch
  });
  return pageEvent;
}
function handleIslandsRouting(pageEvent, markup) {
  return markup;
}

const MetaContext = createContext();
const cascadingTags = ["title", "meta"];
const getTagType = tag => tag.tag + (tag.name ? `.${tag.name}"` : "");
const MetaProvider = props => {
  if (!isServer && !sharedConfig.context) {
    const ssrTags = document.head.querySelectorAll(`[data-sm]`);
    // `forEach` on `NodeList` is not supported in Googlebot, so use a workaround
    Array.prototype.forEach.call(ssrTags, ssrTag => ssrTag.parentNode.removeChild(ssrTag));
  }
  const cascadedTagInstances = new Map();
  // TODO: use one element for all tags of the same type, just swap out
  // where the props get applied
  function getElement(tag) {
    if (tag.ref) {
      return tag.ref;
    }
    let el = document.querySelector(`[data-sm="${tag.id}"]`);
    if (el) {
      if (el.tagName.toLowerCase() !== tag.tag) {
        if (el.parentNode) {
          // remove the old tag
          el.parentNode.removeChild(el);
        }
        // add the new tag
        el = document.createElement(tag.tag);
      }
      // use the old tag
      el.removeAttribute("data-sm");
    } else {
      // create a new tag
      el = document.createElement(tag.tag);
    }
    return el;
  }
  const actions = {
    addClientTag: tag => {
      let tagType = getTagType(tag);
      if (cascadingTags.indexOf(tag.tag) !== -1) {
        //  only cascading tags need to be kept as singletons
        if (!cascadedTagInstances.has(tagType)) {
          cascadedTagInstances.set(tagType, []);
        }
        let instances = cascadedTagInstances.get(tagType);
        let index = instances.length;
        instances = [...instances, tag];
        // track indices synchronously
        cascadedTagInstances.set(tagType, instances);
        if (!isServer) {
          let element = getElement(tag);
          tag.ref = element;
          spread(element, tag.props);
          let lastVisited = null;
          for (var i = index - 1; i >= 0; i--) {
            if (instances[i] != null) {
              lastVisited = instances[i];
              break;
            }
          }
          if (element.parentNode != document.head) {
            document.head.appendChild(element);
          }
          if (lastVisited && lastVisited.ref) {
            document.head.removeChild(lastVisited.ref);
          }
        }
        return index;
      }
      if (!isServer) {
        let element = getElement(tag);
        tag.ref = element;
        spread(element, tag.props);
        if (element.parentNode != document.head) {
          document.head.appendChild(element);
        }
      }
      return -1;
    },
    removeClientTag: (tag, index) => {
      const tagName = getTagType(tag);
      if (tag.ref) {
        const t = cascadedTagInstances.get(tagName);
        if (t) {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
            for (let i = index - 1; i >= 0; i--) {
              if (t[i] != null) {
                document.head.appendChild(t[i].ref);
              }
            }
          }
          t[index] = null;
          cascadedTagInstances.set(tagName, t);
        } else {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
          }
        }
      }
    }
  };
  if (isServer) {
    actions.addServerTag = tagDesc => {
      const {
        tags = []
      } = props;
      // tweak only cascading tags
      if (cascadingTags.indexOf(tagDesc.tag) !== -1) {
        const index = tags.findIndex(prev => {
          const prevName = prev.props.name || prev.props.property;
          const nextName = tagDesc.props.name || tagDesc.props.property;
          return prev.tag === tagDesc.tag && prevName === nextName;
        });
        if (index !== -1) {
          tags.splice(index, 1);
        }
      }
      tags.push(tagDesc);
    };
    if (Array.isArray(props.tags) === false) {
      throw Error("tags array should be passed to <MetaProvider /> in node");
    }
  }
  return createComponent(MetaContext.Provider, {
    value: actions,
    get children() {
      return props.children;
    }
  });
};
const MetaTag = (tag, props) => {
  const id = createUniqueId();
  const c = useContext(MetaContext);
  if (!c) throw new Error("<MetaProvider /> should be in the tree");
  useHead({
    tag,
    props,
    id,
    get name() {
      return props.name || props.property;
    }
  });
  return null;
};
function useHead(tagDesc) {
  const {
    addClientTag,
    removeClientTag,
    addServerTag
  } = useContext(MetaContext);
  createRenderEffect(() => {
    if (!isServer) {
      let index = addClientTag(tagDesc);
      onCleanup(() => removeClientTag(tagDesc, index));
    }
  });
  if (isServer) {
    addServerTag(tagDesc);
    return null;
  }
}
function renderTags(tags) {
  return tags.map(tag => {
    const keys = Object.keys(tag.props);
    const props = keys.map(k => k === "children" ? "" : ` ${k}="${tag.props[k]}"`).join("");
    return tag.props.children ? `<${tag.tag} data-sm="${tag.id}"${props}>${
    // Tags might contain multiple text children:
    //   <Title>example - {myCompany}</Title>
    Array.isArray(tag.props.children) ? tag.props.children.join("") : tag.props.children}</${tag.tag}>` : `<${tag.tag} data-sm="${tag.id}"${props}/>`;
  }).join("");
}
const Title = props => MetaTag("title", props);
const Meta$1 = props => MetaTag("meta", props);

function bindEvent(target, type, handler) {
    target.addEventListener(type, handler);
    return () => target.removeEventListener(type, handler);
}
function intercept([value, setValue], get, set) {
    return [get ? () => get(value()) : value, set ? (v) => setValue(set(v)) : setValue];
}
function querySelector(selector) {
    // Guard against selector being an invalid CSS selector
    try {
        return document.querySelector(selector);
    }
    catch (e) {
        return null;
    }
}
function scrollToHash(hash, fallbackTop) {
    const el = querySelector(`#${hash}`);
    if (el) {
        el.scrollIntoView();
    }
    else if (fallbackTop) {
        window.scrollTo(0, 0);
    }
}
function createIntegration(get, set, init, utils) {
    let ignore = false;
    const wrap = (value) => (typeof value === "string" ? { value } : value);
    const signal = intercept(createSignal(wrap(get()), { equals: (a, b) => a.value === b.value }), undefined, next => {
        !ignore && set(next);
        return next;
    });
    init &&
        onCleanup(init((value = get()) => {
            ignore = true;
            signal[1](wrap(value));
            ignore = false;
        }));
    return {
        signal,
        utils
    };
}
function normalizeIntegration(integration) {
    if (!integration) {
        return {
            signal: createSignal({ value: "" })
        };
    }
    else if (Array.isArray(integration)) {
        return {
            signal: integration
        };
    }
    return integration;
}
function staticIntegration(obj) {
    return {
        signal: [() => obj, next => Object.assign(obj, next)]
    };
}
function pathIntegration() {
    return createIntegration(() => ({
        value: window.location.pathname + window.location.search + window.location.hash,
        state: history.state
    }), ({ value, replace, scroll, state }) => {
        if (replace) {
            window.history.replaceState(state, "", value);
        }
        else {
            window.history.pushState(state, "", value);
        }
        scrollToHash(window.location.hash.slice(1), scroll);
    }, notify => bindEvent(window, "popstate", () => notify()), {
        go: delta => window.history.go(delta)
    });
}

function createBeforeLeave() {
    let listeners = new Set();
    function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
    let ignore = false;
    function confirm(to, options) {
        if (ignore)
            return !(ignore = false);
        const e = {
            to,
            options,
            defaultPrevented: false,
            preventDefault: () => (e.defaultPrevented = true)
        };
        for (const l of listeners)
            l.listener({
                ...e,
                from: l.location,
                retry: (force) => {
                    force && (ignore = true);
                    l.navigate(to, options);
                }
            });
        return !e.defaultPrevented;
    }
    return {
        subscribe,
        confirm
    };
}

const hasSchemeRegex = /^(?:[a-z0-9]+:)?\/\//i;
const trimPathRegex = /^\/+|\/+$/g;
function normalizePath(path, omitSlash = false) {
    const s = path.replace(trimPathRegex, "");
    return s ? (omitSlash || /^[?#]/.test(s) ? s : "/" + s) : "";
}
function resolvePath(base, path, from) {
    if (hasSchemeRegex.test(path)) {
        return undefined;
    }
    const basePath = normalizePath(base);
    const fromPath = from && normalizePath(from);
    let result = "";
    if (!fromPath || path.startsWith("/")) {
        result = basePath;
    }
    else if (fromPath.toLowerCase().indexOf(basePath.toLowerCase()) !== 0) {
        result = basePath + fromPath;
    }
    else {
        result = fromPath;
    }
    return (result || "/") + normalizePath(path, !result);
}
function invariant(value, message) {
    if (value == null) {
        throw new Error(message);
    }
    return value;
}
function joinPaths(from, to) {
    return normalizePath(from).replace(/\/*(\*.*)?$/g, "") + normalizePath(to);
}
function extractSearchParams(url) {
    const params = {};
    url.searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}
function urlDecode(str, isQuery) {
    return decodeURIComponent(isQuery ? str.replace(/\+/g, " ") : str);
}
function createMatcher(path, partial) {
    const [pattern, splat] = path.split("/*", 2);
    const segments = pattern.split("/").filter(Boolean);
    const len = segments.length;
    return (location) => {
        const locSegments = location.split("/").filter(Boolean);
        const lenDiff = locSegments.length - len;
        if (lenDiff < 0 || (lenDiff > 0 && splat === undefined && !partial)) {
            return null;
        }
        const match = {
            path: len ? "" : "/",
            params: {}
        };
        for (let i = 0; i < len; i++) {
            const segment = segments[i];
            const locSegment = locSegments[i];
            if (segment[0] === ":") {
                match.params[segment.slice(1)] = locSegment;
            }
            else if (segment.localeCompare(locSegment, undefined, { sensitivity: "base" }) !== 0) {
                return null;
            }
            match.path += `/${locSegment}`;
        }
        if (splat) {
            match.params[splat] = lenDiff ? locSegments.slice(-lenDiff).join("/") : "";
        }
        return match;
    };
}
function scoreRoute(route) {
    const [pattern, splat] = route.pattern.split("/*", 2);
    const segments = pattern.split("/").filter(Boolean);
    return segments.reduce((score, segment) => score + (segment.startsWith(":") ? 2 : 3), segments.length - (splat === undefined ? 0 : 1));
}
function createMemoObject(fn) {
    const map = new Map();
    const owner = getOwner();
    return new Proxy({}, {
        get(_, property) {
            if (!map.has(property)) {
                runWithOwner(owner, () => map.set(property, createMemo(() => fn()[property])));
            }
            return map.get(property)();
        },
        getOwnPropertyDescriptor() {
            return {
                enumerable: true,
                configurable: true
            };
        },
        ownKeys() {
            return Reflect.ownKeys(fn());
        }
    });
}
function expandOptionals(pattern) {
    let match = /(\/?\:[^\/]+)\?/.exec(pattern);
    if (!match)
        return [pattern];
    let prefix = pattern.slice(0, match.index);
    let suffix = pattern.slice(match.index + match[0].length);
    const prefixes = [prefix, (prefix += match[1])];
    // This section handles adjacent optional params. We don't actually want all permuations since
    // that will lead to equivalent routes which have the same number of params. For example
    // `/:a?/:b?/:c`? only has the unique expansion: `/`, `/:a`, `/:a/:b`, `/:a/:b/:c` and we can
    // discard `/:b`, `/:c`, `/:b/:c` by building them up in order and not recursing. This also helps
    // ensure predictability where earlier params have precidence.
    while ((match = /^(\/\:[^\/]+)\?/.exec(suffix))) {
        prefixes.push((prefix += match[1]));
        suffix = suffix.slice(match[0].length);
    }
    return expandOptionals(suffix).reduce((results, expansion) => [...results, ...prefixes.map(p => p + expansion)], []);
}

const MAX_REDIRECTS = 100;
const RouterContextObj = createContext();
const RouteContextObj = createContext();
const useRouter = () => invariant(useContext(RouterContextObj), "Make sure your app is wrapped in a <Router />");
let TempRoute;
const useRoute = () => TempRoute || useContext(RouteContextObj) || useRouter().base;
const useNavigate$1 = () => useRouter().navigatorFactory();
const useLocation = () => useRouter().location;
const useRouteData = () => useRoute().data;
function createRoutes(routeDef, base = "", fallback) {
    const { component, data, children } = routeDef;
    const isLeaf = !children || (Array.isArray(children) && !children.length);
    const shared = {
        key: routeDef,
        element: component
            ? () => createComponent$1(component, {})
            : () => {
                const { element } = routeDef;
                return element === undefined && fallback
                    ? createComponent$1(fallback, {})
                    : element;
            },
        preload: routeDef.component
            ? component.preload
            : routeDef.preload,
        data
    };
    return asArray(routeDef.path).reduce((acc, path) => {
        for (const originalPath of expandOptionals(path)) {
            const path = joinPaths(base, originalPath);
            const pattern = isLeaf ? path : path.split("/*", 1)[0];
            acc.push({
                ...shared,
                originalPath,
                pattern,
                matcher: createMatcher(pattern, !isLeaf)
            });
        }
        return acc;
    }, []);
}
function createBranch(routes, index = 0) {
    return {
        routes,
        score: scoreRoute(routes[routes.length - 1]) * 10000 - index,
        matcher(location) {
            const matches = [];
            for (let i = routes.length - 1; i >= 0; i--) {
                const route = routes[i];
                const match = route.matcher(location);
                if (!match) {
                    return null;
                }
                matches.unshift({
                    ...match,
                    route
                });
            }
            return matches;
        }
    };
}
function asArray(value) {
    return Array.isArray(value) ? value : [value];
}
function createBranches(routeDef, base = "", fallback, stack = [], branches = []) {
    const routeDefs = asArray(routeDef);
    for (let i = 0, len = routeDefs.length; i < len; i++) {
        const def = routeDefs[i];
        if (def && typeof def === "object" && def.hasOwnProperty("path")) {
            const routes = createRoutes(def, base, fallback);
            for (const route of routes) {
                stack.push(route);
                const isEmptyArray = Array.isArray(def.children) && def.children.length === 0;
                if (def.children && !isEmptyArray) {
                    createBranches(def.children, route.pattern, fallback, stack, branches);
                }
                else {
                    const branch = createBranch([...stack], branches.length);
                    branches.push(branch);
                }
                stack.pop();
            }
        }
    }
    // Stack will be empty on final return
    return stack.length ? branches : branches.sort((a, b) => b.score - a.score);
}
function getRouteMatches(branches, location) {
    for (let i = 0, len = branches.length; i < len; i++) {
        const match = branches[i].matcher(location);
        if (match) {
            return match;
        }
    }
    return [];
}
function createLocation(path, state) {
    const origin = new URL("http://sar");
    const url = createMemo(prev => {
        const path_ = path();
        try {
            return new URL(path_, origin);
        }
        catch (err) {
            console.error(`Invalid path ${path_}`);
            return prev;
        }
    }, origin, {
        equals: (a, b) => a.href === b.href
    });
    const pathname = createMemo(() => urlDecode(url().pathname));
    const search = createMemo(() => urlDecode(url().search, true));
    const hash = createMemo(() => urlDecode(url().hash));
    const key = createMemo(() => "");
    return {
        get pathname() {
            return pathname();
        },
        get search() {
            return search();
        },
        get hash() {
            return hash();
        },
        get state() {
            return state();
        },
        get key() {
            return key();
        },
        query: createMemoObject(on(search, () => extractSearchParams(url())))
    };
}
function createRouterContext(integration, base = "", data, out) {
    const { signal: [source, setSource], utils = {} } = normalizeIntegration(integration);
    const parsePath = utils.parsePath || (p => p);
    const renderPath = utils.renderPath || (p => p);
    const beforeLeave = utils.beforeLeave || createBeforeLeave();
    const basePath = resolvePath("", base);
    const output = isServer && out
        ? Object.assign(out, {
            matches: [],
            url: undefined
        })
        : undefined;
    if (basePath === undefined) {
        throw new Error(`${basePath} is not a valid base path`);
    }
    else if (basePath && !source().value) {
        setSource({ value: basePath, replace: true, scroll: false });
    }
    const [isRouting, setIsRouting] = createSignal(false);
    const start = async (callback) => {
        setIsRouting(true);
        try {
            await startTransition(callback);
        }
        finally {
            setIsRouting(false);
        }
    };
    const [reference, setReference] = createSignal(source().value);
    const [state, setState] = createSignal(source().state);
    const location = createLocation(reference, state);
    const referrers = [];
    const baseRoute = {
        pattern: basePath,
        params: {},
        path: () => basePath,
        outlet: () => null,
        resolvePath(to) {
            return resolvePath(basePath, to);
        }
    };
    if (data) {
        try {
            TempRoute = baseRoute;
            baseRoute.data = data({
                data: undefined,
                params: {},
                location,
                navigate: navigatorFactory(baseRoute)
            });
        }
        finally {
            TempRoute = undefined;
        }
    }
    function navigateFromRoute(route, to, options) {
        // Untrack in case someone navigates in an effect - don't want to track `reference` or route paths
        untrack(() => {
            if (typeof to === "number") {
                if (!to) ;
                else if (utils.go) {
                    beforeLeave.confirm(to, options) && utils.go(to);
                }
                else {
                    console.warn("Router integration does not support relative routing");
                }
                return;
            }
            const { replace, resolve, scroll, state: nextState } = {
                replace: false,
                resolve: true,
                scroll: true,
                ...options
            };
            const resolvedTo = resolve ? route.resolvePath(to) : resolvePath("", to);
            if (resolvedTo === undefined) {
                throw new Error(`Path '${to}' is not a routable path`);
            }
            else if (referrers.length >= MAX_REDIRECTS) {
                throw new Error("Too many redirects");
            }
            const current = reference();
            if (resolvedTo !== current || nextState !== state()) {
                if (isServer) {
                    if (output) {
                        output.url = resolvedTo;
                    }
                    setSource({ value: resolvedTo, replace, scroll, state: nextState });
                }
                else if (beforeLeave.confirm(resolvedTo, options)) {
                    const len = referrers.push({ value: current, replace, scroll, state: state() });
                    start(() => {
                        setReference(resolvedTo);
                        setState(nextState);
                        resetErrorBoundaries();
                    }).then(() => {
                        if (referrers.length === len) {
                            navigateEnd({
                                value: resolvedTo,
                                state: nextState
                            });
                        }
                    });
                }
            }
        });
    }
    function navigatorFactory(route) {
        // Workaround for vite issue (https://github.com/vitejs/vite/issues/3803)
        route = route || useContext(RouteContextObj) || baseRoute;
        return (to, options) => navigateFromRoute(route, to, options);
    }
    function navigateEnd(next) {
        const first = referrers[0];
        if (first) {
            if (next.value !== first.value || next.state !== first.state) {
                setSource({
                    ...next,
                    replace: first.replace,
                    scroll: first.scroll
                });
            }
            referrers.length = 0;
        }
    }
    createRenderEffect(() => {
        const { value, state } = source();
        // Untrack this whole block so `start` doesn't cause Solid's Listener to be preserved
        untrack(() => {
            if (value !== reference()) {
                start(() => {
                    setReference(value);
                    setState(state);
                });
            }
        });
    });
    if (!isServer) {
        function handleAnchorClick(evt) {
            if (evt.defaultPrevented ||
                evt.button !== 0 ||
                evt.metaKey ||
                evt.altKey ||
                evt.ctrlKey ||
                evt.shiftKey)
                return;
            const a = evt
                .composedPath()
                .find(el => el instanceof Node && el.nodeName.toUpperCase() === "A");
            if (!a || !a.hasAttribute("link"))
                return;
            const href = a.href;
            if (a.target || (!href && !a.hasAttribute("state")))
                return;
            const rel = (a.getAttribute("rel") || "").split(/\s+/);
            if (a.hasAttribute("download") || (rel && rel.includes("external")))
                return;
            const url = new URL(href);
            const pathname = urlDecode(url.pathname);
            if (url.origin !== window.location.origin ||
                (basePath && pathname && !pathname.toLowerCase().startsWith(basePath.toLowerCase())))
                return;
            const to = parsePath(url.pathname + url.search + url.hash);
            const state = a.getAttribute("state");
            evt.preventDefault();
            navigateFromRoute(baseRoute, to, {
                resolve: false,
                replace: a.hasAttribute("replace"),
                scroll: !a.hasAttribute("noscroll"),
                state: state && JSON.parse(state)
            });
        }
        // ensure delegated events run first
        delegateEvents(["click"]);
        document.addEventListener("click", handleAnchorClick);
        onCleanup(() => document.removeEventListener("click", handleAnchorClick));
    }
    return {
        base: baseRoute,
        out: output,
        location,
        isRouting,
        renderPath,
        parsePath,
        navigatorFactory,
        beforeLeave
    };
}
function createRouteContext(router, parent, child, match) {
    const { base, location, navigatorFactory } = router;
    const { pattern, element: outlet, preload, data } = match().route;
    const path = createMemo(() => match().path);
    const params = createMemoObject(() => match().params);
    preload && preload();
    const route = {
        parent,
        pattern,
        get child() {
            return child();
        },
        path,
        params,
        data: parent.data,
        outlet,
        resolvePath(to) {
            return resolvePath(base.path(), to, path());
        }
    };
    if (data) {
        try {
            TempRoute = route;
            route.data = data({ data: parent.data, params, location, navigate: navigatorFactory(route) });
        }
        finally {
            TempRoute = undefined;
        }
    }
    return route;
}

const Router = props => {
  const {
    source,
    url,
    base,
    data,
    out
  } = props;
  const integration = source || (isServer ? staticIntegration({
    value: url || ""
  }) : pathIntegration());
  const routerState = createRouterContext(integration, base, data, out);
  return createComponent(RouterContextObj.Provider, {
    value: routerState,
    get children() {
      return props.children;
    }
  });
};
const Routes$1 = props => {
  const router = useRouter();
  const parentRoute = useRoute();
  const routeDefs = children(() => props.children);
  const branches = createMemo(() => createBranches(routeDefs(), joinPaths(parentRoute.pattern, props.base || ""), Outlet));
  const matches = createMemo(() => getRouteMatches(branches(), router.location.pathname));
  if (router.out) {
    router.out.matches.push(matches().map(({
      route,
      path,
      params
    }) => ({
      originalPath: route.originalPath,
      pattern: route.pattern,
      path,
      params
    })));
  }
  const disposers = [];
  let root;
  const routeStates = createMemo(on(matches, (nextMatches, prevMatches, prev) => {
    let equal = prevMatches && nextMatches.length === prevMatches.length;
    const next = [];
    for (let i = 0, len = nextMatches.length; i < len; i++) {
      const prevMatch = prevMatches && prevMatches[i];
      const nextMatch = nextMatches[i];
      if (prev && prevMatch && nextMatch.route.key === prevMatch.route.key) {
        next[i] = prev[i];
      } else {
        equal = false;
        if (disposers[i]) {
          disposers[i]();
        }
        createRoot(dispose => {
          disposers[i] = dispose;
          next[i] = createRouteContext(router, next[i - 1] || parentRoute, () => routeStates()[i + 1], () => matches()[i]);
        });
      }
    }
    disposers.splice(nextMatches.length).forEach(dispose => dispose());
    if (prev && equal) {
      return prev;
    }
    root = next[0];
    return next;
  }));
  return createComponent(Show, {
    get when() {
      return routeStates() && root;
    },
    children: route => createComponent(RouteContextObj.Provider, {
      value: route,
      get children() {
        return route.outlet();
      }
    })
  });
};
const Outlet = () => {
  const route = useRoute();
  return createComponent(Show, {
    get when() {
      return route.child;
    },
    children: child => createComponent(RouteContextObj.Provider, {
      value: child,
      get children() {
        return child.outlet();
      }
    })
  });
};

class ServerError extends Error {
  constructor(message, {
    status,
    stack
  } = {}) {
    super(message);
    this.name = "ServerError";
    this.status = status || 400;
    if (stack) {
      this.stack = stack;
    }
  }
}
class FormError extends ServerError {
  constructor(message, {
    fieldErrors = {},
    form,
    fields,
    stack
  } = {}) {
    super(message, {
      stack
    });
    this.formError = message;
    this.name = "FormError";
    this.fields = fields || Object.fromEntries(typeof form !== "undefined" ? form.entries() : []) || {};
    this.fieldErrors = fieldErrors;
  }
}

const ServerContext = createContext({});

createContext();
createContext();

const Routes = Routes$1;
Outlet;
useLocation;
const useNavigate = useNavigate$1;

const resources = new Set();
const promises = new Map();
function createRouteData(fetcher, options = {}) {
  const navigate = useNavigate();
  const pageEvent = useContext(ServerContext);
  function handleResponse(response) {
    if (isRedirectResponse(response)) {
      startTransition(() => {
        let url = response.headers.get(LocationHeader);
        if (url && url.startsWith("/")) {
          navigate(url, {
            replace: true
          });
        } else {
          if (!isServer && url) {
            window.location.href = url;
          }
        }
      });
      if (isServer && pageEvent) {
        pageEvent.setStatusCode(response.status);
        response.headers.forEach((head, value) => {
          pageEvent.responseHeaders.set(value, head);
        });
      }
    }
  }
  const resourceFetcher = async key => {
    try {
      let event = pageEvent;
      if (isServer && pageEvent) {
        event = Object.freeze({
          request: pageEvent.request,
          env: pageEvent.env,
          $type: FETCH_EVENT,
          fetch: pageEvent.fetch
        });
      }
      let response = await fetcher.call(event, key, event);
      if (response instanceof Response) {
        if (isServer) {
          handleResponse(response);
        } else {
          setTimeout(() => handleResponse(response), 0);
        }
      }
      return response;
    } catch (e) {
      if (e instanceof Response) {
        if (isServer) {
          handleResponse(e);
        } else {
          setTimeout(() => handleResponse(e), 0);
        }
        return e;
      }
      throw e;
    }
  };
  function dedup(fetcher) {
    return (key, info) => {
      if (info.refetching && info.refetching !== true && !partialMatch(key, info.refetching) && info.value) {
        return info.value;
      }
      if (key == true) return fetcher(key, info);
      let promise = promises.get(key);
      if (promise) return promise;
      promise = fetcher(key, info);
      promises.set(key, promise);
      promise.finally(() => promises.delete(key));
      return promise;
    };
  }
  const [resource, {
    refetch
  }] = createResource(options.key || true, dedup(resourceFetcher), {
    storage: init => createDeepSignal(init, options.reconcileOptions),
    ...options
  });
  resources.add(refetch);
  onCleanup(() => resources.delete(refetch));
  return resource;
}
function createDeepSignal(value, options) {
  const [store, setStore] = createStore({
    value
  });
  return [() => store.value, v => {
    const unwrapped = unwrap(store.value);
    typeof v === "function" && (v = v(unwrapped));
    setStore("value", reconcile(v, options));
    return store.value;
  }];
}

/* React Query key matching  https://github.com/tannerlinsley/react-query */
function partialMatch(a, b) {
  return partialDeepEqual(ensureQueryKeyArray(a), ensureQueryKeyArray(b));
}
function ensureQueryKeyArray(value) {
  return Array.isArray(value) ? value : [value];
}

/**
 * Checks if `b` partially matches with `a`.
 */
function partialDeepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a.length && !b.length) return false;
  if (a && b && typeof a === "object" && typeof b === "object") {
    return !Object.keys(b).some(key => !partialDeepEqual(a[key], b[key]));
  }
  return false;
}

const server$ = (_fn) => {
  throw new Error("Should be compiled away");
};
async function parseRequest(event) {
  let request = event.request;
  let contentType = request.headers.get(ContentTypeHeader);
  let name = new URL(request.url).pathname, args = [];
  if (contentType) {
    if (contentType === JSONResponseType) {
      let text = await request.text();
      try {
        args = JSON.parse(text, (key, value) => {
          if (!value) {
            return value;
          }
          if (value.$type === "fetch_event") {
            return event;
          }
          if (value.$type === "headers") {
            let headers = new Headers();
            request.headers.forEach((value2, key2) => headers.set(key2, value2));
            value.values.forEach(([key2, value2]) => headers.set(key2, value2));
            return headers;
          }
          if (value.$type === "request") {
            return new Request(value.url, {
              method: value.method,
              headers: value.headers
            });
          }
          return value;
        });
      } catch (e) {
        throw new Error(`Error parsing request body: ${text}`);
      }
    } else if (contentType.includes("form")) {
      let formData = await request.clone().formData();
      args = [formData, event];
    }
  }
  return [name, args];
}
function respondWith(request, data, responseType) {
  if (data instanceof ResponseError) {
    data = data.clone();
  }
  if (data instanceof Response) {
    if (isRedirectResponse(data) && request.headers.get(XSolidStartOrigin) === "client") {
      let headers = new Headers(data.headers);
      headers.set(XSolidStartOrigin, "server");
      headers.set(XSolidStartLocationHeader, data.headers.get(LocationHeader));
      headers.set(XSolidStartResponseTypeHeader, responseType);
      headers.set(XSolidStartContentTypeHeader, "response");
      return new Response(null, {
        status: 204,
        statusText: "Redirected",
        headers
      });
    } else if (data.status === 101) {
      return data;
    } else {
      let headers = new Headers(data.headers);
      headers.set(XSolidStartOrigin, "server");
      headers.set(XSolidStartResponseTypeHeader, responseType);
      headers.set(XSolidStartContentTypeHeader, "response");
      return new Response(data.body, {
        status: data.status,
        statusText: data.statusText,
        headers
      });
    }
  } else if (data instanceof FormError) {
    return new Response(
      JSON.stringify({
        error: {
          message: data.message,
          stack: "",
          formError: data.formError,
          fields: data.fields,
          fieldErrors: data.fieldErrors
        }
      }),
      {
        status: 400,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "form-error"
        }
      }
    );
  } else if (data instanceof ServerError) {
    return new Response(
      JSON.stringify({
        error: {
          message: data.message,
          stack: ""
        }
      }),
      {
        status: data.status,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "server-error"
        }
      }
    );
  } else if (data instanceof Error) {
    console.error(data);
    return new Response(
      JSON.stringify({
        error: {
          message: "Internal Server Error",
          stack: "",
          status: data.status
        }
      }),
      {
        status: data.status || 500,
        headers: {
          [XSolidStartResponseTypeHeader]: responseType,
          [XSolidStartContentTypeHeader]: "error"
        }
      }
    );
  } else if (typeof data === "object" || typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        [ContentTypeHeader]: "application/json",
        [XSolidStartResponseTypeHeader]: responseType,
        [XSolidStartContentTypeHeader]: "json"
      }
    });
  }
  return new Response("null", {
    status: 200,
    headers: {
      [ContentTypeHeader]: "application/json",
      [XSolidStartContentTypeHeader]: "json",
      [XSolidStartResponseTypeHeader]: responseType
    }
  });
}
async function handleServerRequest(event) {
  const url = new URL(event.request.url);
  if (server$.hasHandler(url.pathname)) {
    try {
      let [name, args] = await parseRequest(event);
      let handler = server$.getHandler(name);
      if (!handler) {
        throw {
          status: 404,
          message: "Handler Not Found for " + name
        };
      }
      const data = await handler.call(event, ...Array.isArray(args) ? args : [args]);
      return respondWith(event.request, data, "return");
    } catch (error) {
      return respondWith(event.request, error, "throw");
    }
  }
  return null;
}
const handlers = /* @__PURE__ */ new Map();
server$.createHandler = (_fn, hash) => {
  let fn = function(...args) {
    let ctx;
    if (typeof this === "object") {
      ctx = this;
    } else if (sharedConfig.context && sharedConfig.context.requestContext) {
      ctx = sharedConfig.context.requestContext;
    } else {
      ctx = {
        request: new URL(hash, "http://localhost:3000").href,
        responseHeaders: new Headers()
      };
    }
    const execute = async () => {
      try {
        let e = await _fn.call(ctx, ...args);
        return e;
      } catch (e) {
        if (e instanceof Error && /[A-Za-z]+ is not defined/.test(e.message)) {
          const error = new Error(
            e.message + "\n You probably are using a variable defined in a closure in your server function."
          );
          error.stack = e.stack;
          throw error;
        }
        throw e;
      }
    };
    return execute();
  };
  fn.url = hash;
  fn.action = function(...args) {
    return fn.call(this, ...args);
  };
  return fn;
};
server$.registerHandler = function(route, handler) {
  handlers.set(route, handler);
};
server$.getHandler = function(route) {
  return handlers.get(route);
};
server$.hasHandler = function(route) {
  return handlers.has(route);
};
server$.fetch = internalFetch;

const _tmpl$$c = ["<div", " style=\"", "\"><div style=\"", "\"><p style=\"", "\" id=\"error-message\">", "</p><button id=\"reset-errors\" style=\"", "\">Clear errors and retry</button><pre style=\"", "\">", "</pre></div></div>"];
function ErrorBoundary(props) {
  return createComponent(ErrorBoundary$1, {
    fallback: (e, reset) => {
      return createComponent(Show, {
        get when() {
          return !props.fallback;
        },
        get fallback() {
          return props.fallback && props.fallback(e, reset);
        },
        get children() {
          return createComponent(ErrorMessage, {
            error: e
          });
        }
      });
    },
    get children() {
      return props.children;
    }
  });
}
function ErrorMessage(props) {
  createEffect(() => console.error(props.error));
  return ssr(_tmpl$$c, ssrHydrationKey(), "padding:" + "16px", "background-color:" + "rgba(252, 165, 165)" + (";color:" + "rgb(153, 27, 27)") + (";border-radius:" + "5px") + (";overflow:" + "scroll") + (";padding:" + "16px") + (";margin-bottom:" + "8px"), "font-weight:" + "bold", escape(props.error.message), "color:" + "rgba(252, 165, 165)" + (";background-color:" + "rgb(153, 27, 27)") + (";border-radius:" + "5px") + (";padding:" + "4px 8px"), "margin-top:" + "8px" + (";width:" + "100%"), escape(props.error.stack));
}

const routeLayouts = {
  "/": {
    "id": "/",
    "layouts": []
  }
};

const _tmpl$$b = ["<link", " rel=\"stylesheet\"", ">"],
  _tmpl$2$3 = ["<link", " rel=\"modulepreload\"", ">"];
function flattenIslands(match, manifest) {
  let result = [...match];
  match.forEach(m => {
    if (m.type !== "island") return;
    const islandManifest = manifest[m.href];
    if (islandManifest) {
      const res = flattenIslands(islandManifest.assets, manifest);
      result.push(...res);
    }
  });
  return result;
}
function getAssetsFromManifest(manifest, routerContext) {
  let match = routerContext.matches ? routerContext.matches.reduce((memo, m) => {
    if (m.length) {
      const fullPath = m.reduce((previous, match) => previous + match.originalPath, "");
      const route = routeLayouts[fullPath];
      if (route) {
        memo.push(...(manifest[route.id] || []));
        const layoutsManifestEntries = route.layouts.flatMap(manifestKey => manifest[manifestKey] || []);
        memo.push(...layoutsManifestEntries);
      }
    }
    return memo;
  }, []) : [];
  match.push(...(manifest["entry-client"] || []));
  match = manifest ? flattenIslands(match, manifest) : [];
  const links = match.reduce((r, src) => {
    r[src.href] = src.type === "style" ? ssr(_tmpl$$b, ssrHydrationKey(), ssrAttribute("href", escape(src.href, true), false)) : src.type === "script" ? ssr(_tmpl$2$3, ssrHydrationKey(), ssrAttribute("href", escape(src.href, true), false)) : undefined;
    return r;
  }, {});
  return Object.values(links);
}

/**
 * Links are used to load assets for the server rendered HTML
 * @returns {JSXElement}
 */
function Links() {
  const context = useContext(ServerContext);
  useAssets(() => getAssetsFromManifest(context.env.manifest, context.routerContext));
  return null;
}

function Meta() {
  const context = useContext(ServerContext);
  // @ts-expect-error The ssr() types do not match the Assets child types
  useAssets(() => ssr(renderTags(context.tags)));
  return null;
}

const _tmpl$4$1 = ["<script", " type=\"module\" async", "></script>"];
const isDev = "production" === "development";
const isIslands = false;
function Scripts() {
  const context = useContext(ServerContext);
  return [createComponent(HydrationScript, {}), isIslands , createComponent(NoHydration, {
    get children() {
      return isServer && (      ssr(_tmpl$4$1, ssrHydrationKey(), ssrAttribute("src", escape(context.env.manifest["entry-client"][0].href, true), false)) );
    }
  }), isDev ];
}

function Html(props) {
  {
    return ssrElement("html", props, undefined, false);
  }
}
function Head(props) {
  {
    return ssrElement("head", props, () => [props.children, createComponent(Meta, {}), createComponent(Links, {})], false);
  }
}
function Body(props) {
  {
    return ssrElement("body", props, () => props.children , false);
  }
}

const clientId = "WWVNb0F2Vk5vSTNILXFfOXVrNWM6MTpjaQ";
const authorize = ({ redirectUri = "http://localhost:3000/api/auth/twitter/callback" } = {}) => {
  const scopes = ["tweet.read", "tweet.write", "follows.write", "like.write", "users.read"];
  const oAuthPopup = window.open(`https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&state=state&code_challenge=challenge&code_challenge_method=plain`, "_blank");
  return new Promise((resolve, reject) => {
    if (!oAuthPopup) {
      reject(new Error("Failed to open popup"));
      return;
    }
    const respondToWindowClose = () => {
      resolve(null);
    };
    oAuthPopup.addEventListener("beforeunload", respondToWindowClose);
  });
};
const getToken = async ({ authCode, redirectUri }) => {
  const obj = {
    "code": authCode,
    "grant_type": "authorization_code",
    "client_id": clientId,
    "redirect_uri": redirectUri,
    "code_verifier": "challenge"
  };
  return await fetch(`https://api.twitter.com/2/oauth2/token`, {
    headers: {
      Authorization: "Basic V1dWTmIwRjJWazV2U1ROSUxYRmZPWFZyTldNNk1UcGphUTp0SHVXUFJ4MDNPS0ZpcVNqUU9sdVoyNkFYUFU3ZmNOa0JqRnlYWnhodms3UjlmdllSWQ==",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(obj).toString(),
    method: "POST"
  }).then((r) => r.json());
};

const _tmpl$$a = ["<button", ">", "</button>"];
function Button(props) {
  return ssr(_tmpl$$a, ssrHydrationKey() + ssrAttribute("class", escape(clsx(props.fullWidth && "w-full justify-center ", props.color === "secondary" ? "text-white bg-gray-600" : "dark:text-black dark:bg-white dark:hover:bg-white bg-sky-600 hover:bg-sky-500 text-white", !props.condensed ? "text-lg" : "text-sm", "flex items-center font-bold px-4 py-2 rounded-3xl"), true), false), escape(props.children));
}

const _tmpl$$9 = ["<svg", " version=\"1.0\" viewBox=\"0 0 740.000000 715.000000\" preserveAspectRatio=\"xMidYMid meet\" width=\"", "\" height=\"", "\"><g class=\"dark:fill-white fill-black\" transform=\"translate(0.000000,715.000000) scale(0.100000,-0.100000)\" stroke=\"none\"><path d=\"M2015 7140 c-285 -40 -492 -99 -720 -207 -196 -93 -418 -245 -533\n-365 -111 -117 -202 -227 -253 -308 -96 -149 -85 -132 -138 -232 -65 -122 -81\n-156 -96 -202 -7 -22 -25 -72 -39 -111 -46 -124 -103 -299 -115 -350 -6 -27\n-16 -72 -22 -100 -69 -308 -110 -762 -90 -1010 20 -247 40 -449 50 -495 16\n-70 41 -206 57 -300 18 -111 39 -192 79 -315 18 -55 45 -152 60 -215 15 -63\n33 -125 41 -137 8 -12 14 -29 14 -37 0 -20 60 -173 164 -418 26 -59 46 -112\n46 -117 0 -20 190 -362 264 -476 29 -44 79 -120 111 -170 33 -49 99 -139 148\n-200 96 -119 347 -395 360 -395 4 0 33 -24 65 -53 143 -129 192 -169 263 -215\n42 -28 80 -55 83 -61 10 -15 101 -73 195 -123 42 -23 103 -59 135 -80 33 -21\n63 -38 67 -38 4 0 47 -18 96 -41 129 -60 139 -64 243 -108 52 -22 115 -45 139\n-51 24 -6 51 -15 60 -20 16 -9 53 -19 171 -47 59 -14 99 -25 251 -68 25 -7 84\n-18 130 -24 46 -6 116 -15 154 -20 170 -23 424 -31 626 -21 112 6 231 15 264\n21 33 5 101 16 150 24 50 8 126 26 169 40 44 14 102 31 130 37 28 6 63 17 78\n24 15 8 35 14 45 14 10 0 35 9 56 20 20 11 43 20 51 20 33 0 410 192 530 271\n56 36 117 74 136 85 19 10 62 44 95 74 34 30 88 74 120 97 33 24 94 75 135\n114 41 40 95 90 119 112 25 21 59 56 75 77 17 21 78 89 135 152 98 106 222\n262 265 332 11 17 43 63 72 101 58 78 174 252 174 260 0 3 39 74 87 158 101\n177 293 552 293 573 0 12 65 164 106 248 8 16 13 31 11 33 -7 6 -46 -56 -83\n-128 -39 -78 -211 -346 -250 -389 -12 -14 -59 -79 -105 -145 -109 -159 -365\n-477 -491 -612 -279 -297 -558 -558 -706 -660 -26 -18 -87 -61 -135 -95 -128\n-91 -191 -129 -442 -263 -44 -24 -125 -59 -180 -79 -239 -84 -274 -96 -345\n-114 -41 -11 -102 -23 -134 -27 -33 -4 -71 -11 -85 -17 -14 -5 -73 -16 -131\n-24 -332 -45 -571 -45 -845 0 -281 47 -430 78 -495 103 -14 6 -59 20 -100 32\n-41 13 -97 31 -125 41 -27 10 -61 22 -75 25 -94 27 -438 204 -590 304 -157\n103 -257 175 -274 195 -6 7 -40 37 -76 66 -36 30 -117 108 -182 175 -64 66\n-132 136 -152 155 -19 19 -57 67 -85 105 -27 39 -78 104 -112 147 -34 42 -76\n102 -94 135 -18 32 -56 96 -85 143 -60 96 -160 292 -160 312 0 8 -16 38 -35\n68 -19 30 -35 61 -35 70 0 9 -16 54 -36 100 -20 47 -52 126 -70 175 -19 50\n-39 99 -44 110 -15 33 -50 143 -50 159 0 8 4 17 8 20 9 5 356 -18 482 -32 l65\n-7 57 -113 c31 -63 69 -133 84 -155 32 -48 47 -74 88 -149 30 -56 99 -153 126\n-178 10 -8 41 -44 70 -80 103 -126 155 -183 190 -207 19 -13 58 -42 85 -64\n260 -212 573 -335 972 -384 158 -19 333 -49 393 -69 43 -13 76 -27 198 -82 29\n-13 55 -24 58 -24 14 0 157 -99 226 -157 130 -108 231 -229 298 -358 23 -44\n45 -84 49 -88 8 -8 177 58 186 73 2 4 -5 54 -17 111 -19 93 -22 136 -22 399 0\n302 13 448 41 472 18 15 56 -3 172 -80 116 -78 259 -193 322 -259 62 -65 177\n-217 211 -278 49 -87 119 -239 125 -268 11 -53 59 -68 140 -44 59 17 65 27 65\n94 1 51 -6 73 -57 178 -115 236 -157 302 -283 443 -153 171 -321 296 -555 414\n-54 27 -101 57 -104 65 -3 8 6 63 20 122 14 58 33 142 42 186 25 123 56 264\n72 330 9 33 22 91 29 128 8 38 16 72 18 75 2 4 9 52 16 107 6 55 18 136 26\n180 8 44 18 149 21 233 6 144 7 154 27 162 12 5 85 18 163 30 203 31 614 31\n818 1 276 -42 651 -149 844 -241 9 -4 32 -14 51 -23 19 -8 88 -40 154 -71 65\n-32 125 -56 133 -54 19 4 -170 211 -264 290 -195 164 -327 261 -429 314 -37\n19 -89 50 -118 68 -58 39 -133 78 -262 134 -49 22 -109 49 -134 60 -67 30\n-334 117 -420 136 -41 9 -113 25 -160 35 -87 20 -197 36 -329 49 l-74 7 -3\n235 c-2 129 -8 267 -14 305 -6 39 -15 113 -21 165 -14 136 -44 273 -96 445\n-102 339 -232 591 -409 800 -89 104 -276 286 -339 330 -27 19 -81 58 -120 86\n-38 28 -97 64 -130 79 -33 16 -87 43 -120 62 -62 35 -197 91 -249 104 -16 4\n-41 13 -55 20 -14 8 -33 14 -42 14 -8 0 -51 9 -95 21 -82 21 -129 31 -274 54\n-89 15 -413 18 -505 5z m530 -234 c66 -10 152 -27 190 -38 127 -38 220 -70\n230 -79 5 -5 15 -9 22 -9 25 0 259 -118 329 -166 102 -69 260 -202 329 -276\n118 -126 231 -269 273 -345 101 -183 210 -443 200 -475 -3 -8 -30 -13 -79 -14\n-73 -2 -230 -33 -279 -56 -14 -7 -58 -37 -99 -68 -78 -58 -103 -95 -116 -176\n-7 -48 -5 -50 85 -90 121 -52 257 -154 355 -264 50 -56 101 -120 115 -143 14\n-24 35 -57 48 -75 35 -48 116 -226 142 -312 34 -109 35 -287 2 -348 -36 -68\n-138 -120 -210 -107 -20 3 -67 17 -103 31 -56 21 -81 39 -155 113 -113 111\n-156 129 -267 111 -125 -21 -256 -99 -442 -262 -88 -77 -256 -260 -328 -358\n-234 -315 -349 -552 -406 -835 -22 -113 -35 -245 -23 -245 4 0 25 24 47 52 47\n62 356 381 435 450 30 26 93 81 140 123 94 83 163 133 197 141 15 4 47 -8 100\n-38 163 -92 271 -118 403 -97 76 12 122 32 222 99 85 57 121 109 163 237 29\n87 28 121 -3 108 -9 -5 -49 -19 -89 -32 -56 -19 -85 -36 -130 -79 -81 -76\n-132 -99 -213 -98 -87 2 -165 31 -165 62 0 25 14 35 155 100 120 56 256 104\n360 128 30 7 80 19 110 28 104 28 159 38 171 31 6 -5 8 -20 5 -39 -4 -18 -13\n-98 -21 -179 -8 -80 -21 -179 -29 -219 -8 -40 -17 -95 -21 -123 -3 -27 -12\n-70 -20 -95 -7 -25 -16 -63 -20 -85 -8 -53 -83 -399 -97 -450 -38 -140 -92\n-455 -108 -635 -6 -58 -14 -170 -20 -249 -6 -79 -13 -147 -16 -152 -11 -18\n-31 -8 -69 32 -45 46 -123 107 -182 140 -105 61 -214 113 -292 141 -47 16 -99\n36 -116 43 -16 7 -41 16 -55 19 -14 3 -54 12 -90 20 -36 8 -110 18 -165 21\n-55 4 -127 13 -160 20 -33 7 -82 16 -110 19 -170 23 -365 95 -555 206 -36 21\n-120 86 -185 144 -65 58 -121 106 -125 106 -7 0 -190 224 -200 245 -3 5 -27\n44 -54 85 -27 41 -73 116 -102 165 -29 50 -62 105 -73 123 -24 38 -27 65 -8\n79 6 5 37 17 67 27 77 27 150 64 157 81 3 9 19 21 37 29 78 34 135 55 191 71\n33 9 92 25 130 36 39 11 95 26 125 33 30 8 75 19 100 25 25 6 89 18 143 27 53\n9 97 20 97 24 0 17 -60 51 -159 90 -124 50 -229 65 -399 56 -74 -4 -130 -2\n-141 3 -32 17 -203 51 -258 51 -50 0 -196 -33 -218 -50 -5 -4 -27 -10 -48 -14\n-37 -7 -39 -6 -161 111 -141 134 -187 187 -310 361 -100 141 -147 229 -154\n288 -4 37 -1 44 22 59 32 21 117 16 162 -9 156 -88 160 -92 167 -165 7 -82 38\n-138 90 -162 52 -23 89 -24 132 -3 44 21 65 54 72 115 5 40 2 55 -14 77 -11\n15 -41 59 -68 97 -26 39 -66 89 -89 113 -60 63 -181 140 -257 162 -151 45\n-331 9 -418 -84 -32 -35 -37 -100 -17 -222 16 -93 70 -227 111 -274 7 -8 27\n-44 45 -80 43 -85 176 -247 322 -392 66 -65 118 -125 118 -135 0 -21 -60 -74\n-130 -117 -25 -15 -65 -40 -91 -55 -47 -29 -146 -70 -190 -78 -34 -6 -44 9\n-57 87 -6 36 -23 119 -37 185 -15 66 -33 150 -40 188 -8 37 -17 72 -21 78 -11\n18 -43 212 -64 384 -11 88 -24 187 -29 220 -12 78 -13 577 -1 675 22 187 72\n446 92 483 6 12 22 58 34 102 49 177 143 402 189 455 7 8 26 40 42 71 35 68\n157 239 220 309 149 166 384 332 593 417 222 92 279 108 475 138 184 28 424\n28 610 1z m1615 -1636 c11 -11 20 -23 20 -27 0 -5 9 -66 20 -137 11 -71 20\n-135 20 -142 0 -32 -39 -9 -94 54 -32 37 -88 91 -125 121 -95 77 -141 120\n-141 130 0 12 47 17 178 19 90 2 104 0 122 -18z m-2457 -1842 c74 -23 103 -49\n86 -80 -7 -12 -21 -18 -47 -18 -42 0 -68 -13 -58 -28 11 -19 -17 -53 -77 -92\n-62 -41 -84 -42 -89 -7 -4 30 -36 23 -68 -15 -30 -35 -61 -35 -70 1 -5 21 -7\n22 -18 8 -8 -9 -23 -35 -35 -58 -38 -74 -60 -83 -203 -88 -124 -3 -278 12\n-305 30 -11 8 -9 14 15 32 16 12 74 57 130 99 56 43 127 97 158 120 31 24 60\n51 63 60 22 61 358 84 518 36z\"></path><path d=\"M2685 5459 c-33 -5 -71 -13 -85 -18 -14 -5 -40 -13 -58 -16 -48 -10\n-181 -88 -224 -132 -112 -114 -120 -125 -125 -162 -3 -21 0 -47 6 -59 14 -26\n96 -82 120 -82 10 0 52 35 94 79 94 98 151 138 219 152 29 6 72 15 95 20 68\n15 183 10 263 -11 51 -13 78 -16 86 -9 23 19 93 144 96 172 3 25 -2 30 -37 42\n-87 31 -319 43 -450 24z\"></path><path d=\"M2760 5141 c-131 -43 -214 -134 -212 -233 1 -63 26 -113 85 -170 50\n-49 118 -78 181 -78 71 1 171 58 213 121 29 45 41 144 23 208 -27 100 -189\n185 -290 152z m85 -155 c71 -30 82 -95 24 -137 -39 -28 -94 -21 -126 16 -32\n36 -29 61 11 101 38 38 43 40 91 20z\"></path></g></svg>"];
function Logo(props) {
  return ssr(_tmpl$$9, ssrHydrationKey(), `${escape(props.size, true) || 80}px`, `${(escape(props.size, true) || 80) / 1.034965034965035}px`);
}

const _tmpl$$8 = ["<div", " class=\"p-4 w-screen h-screen flex items-center justify-center flex-col gap-8 md:gap-16\"><!--#-->", "<!--/--><div class=\"grid max-w-screen-md gap-4 mx-auto text-center\"><h1 class=\"text-6xl font-bold\">Tejjer</h1><p class=\"text-xl\">This application is a lightweight clone of Twitter with partial feature parity that exists to demonstrate various user interface features and performance. It is open source and used for learning.</p></div><div class=\"flex items-center gap-4\"><!--#-->", "<!--/--><!--#-->", "<!--/--></div></div>"];
function LoginPage() {
  return ssr(_tmpl$$8, ssrHydrationKey(), escape(createComponent(Logo, {
    size: 256
  })), escape(createComponent(Button, {
    onClick: () => {
      console.log("hi");
      authorize();
    },
    children: "Login"
  })), escape(createComponent(Button, {
    color: "secondary",
    onClick: event => window.open("github url @todo"),
    children: "Browse the Code"
  })));
}

const _tmpl$$7 = ["<img", " class=\"rounded-full\"", ">"];
function Avatar(props) {
  return ssr(_tmpl$$7, ssrHydrationKey(), ssrAttribute("width", escape(props.size, true) || 40, false) + ssrAttribute("alt", escape(props.alt, true), false) + ssrAttribute("src", escape(props.url, true), false));
}

const _tmpl$$6 = ["<div", "><div class=\"flex items-center gap-4 p-4\"><div>", "</div><div class=\"w-full\"><textarea class=\"w-full p-4 text-xl border border-gray-300 rounded dark:border-0 dark:text-white dark:bg-black\" id=\"composer\" placeholder=\"What's happening?\"", "></textarea></div></div><div class=\"grid p-4 grid-cols-[1fr,auto]\"><ul class=\"flex items-center gap-4\"><li><button>\uD83D\uDCF8</button></li><li><button>\uD83D\uDCCA</button></li><li><button>\uD83D\uDE04</button></li><li><button>\uD83D\uDD59</button></li><li><button>\uD83D\uDCCD</button></li></ul><div>", "</div></div></div>"];
const postTweet = async ({
  text,
  token
}) => {
  return await fetch("/api/tweet", {
    method: "POST",
    body: JSON.stringify({
      text
    }),
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(r => r.json()).then(() => alert("Done!"));
};
function Composer(props) {
  const [tweet, setTweet] = createSignal("");
  return ssr(_tmpl$$6, ssrHydrationKey(), escape(createComponent(Avatar, {
    get alt() {
      return props.me.name;
    },
    get url() {
      return props.me.profile_image_url;
    },
    size: 64
  })), ssrAttribute("value", escape(tweet(), true), false), escape(createComponent(Button, {
    condensed: true,
    onClick: event => {
      postTweet({
        text: tweet(),
        token: props.token
      });
    },
    children: "Tweet"
  })));
}

const _tmpl$$5 = ["<h2", " class=\"text-2xl font-bold\">", "</h2>"];
function SectionHeading(props) {
  return ssr(_tmpl$$5, ssrHydrationKey(), escape(props.children));
}

const _tmpl$$4 = ["<div", "><div class=\"sticky top-0 grid content-start max-h-screen gap-4 py-4 overflow-auto\"><div><input class=\"w-full px-4 py-2 text-white bg-gray-200 dark:bg-gray-700 rounded-3xl\" type=\"text\" placeholder=\"Search Twitter\"></div><div class=\"grid gap-4 p-4 border border-gray-300 dark:border-0 dark:bg-gray-800 rounded-3xl\"><!--#-->", "<!--/--><p>This is an open-source application that makes basic usage of Twitter, and is intended to be used for teaching and experimenting for people interested in open source.</p></div><div class=\"grid gap-4 p-4 border border-gray-300 dark:border-0 dark:bg-gray-800 rounded-3xl\"><!--#-->", "<!--/--><ul class=\"grid gap-2\">", "</ul></div><div class=\"p-4 text-sm\"><ul class=\"list-disc dark:text-sky-200 text-sky-600\"><li><a href=\"#\">Watch the video on YouTube</a></li><li><a href=\"#\">View the Source Code on GitHub</a></li></ul></div></div></div>"],
  _tmpl$2$2 = ["<li", " class=\"w-full\"><div class=\"flex items-center w-full gap-4\"><div>", "</div><div class=\"grid gap-1 leading-none\"><div><span class=\"font-bold\">", "</span></div><div><span class=\"text-xs\">", "</span></div></div><div class=\"ml-auto\">", "</div></div></li>"];
const peopleToFollow = [{
  name: "Tejas Kumar",
  handle: "@tejaskumar_",
  profile_image_url: "https://github.com/tejasq.png"
}];
function RightSidebar(props) {
  return ssr(_tmpl$$4, ssrHydrationKey(), escape(createComponent(SectionHeading, {
    children: "What is this?"
  })), escape(createComponent(SectionHeading, {
    children: "Who to follow"
  })), escape(createComponent(For, {
    each: peopleToFollow,
    children: (person, _index) => {
      _index();
      return ssr(_tmpl$2$2, ssrHydrationKey(), escape(createComponent(Avatar, {
        get url() {
          return person.profile_image_url;
        },
        get alt() {
          return person.name;
        }
      })), escape(person.name), escape(person.handle), escape(createComponent(Button, {
        onClick: event => alert("Not yet implemented"),
        condensed: true,
        children: "Follow"
      })));
    }
  })));
}

const _tmpl$$3 = ["<div", " class=\"px-4 py-2 text-xl transition rounded-3xl dark:hover:bg-white hover:bg-gray-400 hover:bg-opacity-20\">", "</div>"];
function MenuItem(props) {
  return ssr(_tmpl$$3, ssrHydrationKey(), escape(props.children));
}

const _tmpl$$2 = ["<button", " class=\"w-full text-left\">Home</button>"],
  _tmpl$2$1 = ["<button", " class=\"w-full text-left\">Explore</button>"],
  _tmpl$3 = ["<button", " class=\"w-full text-left\">Communities</button>"],
  _tmpl$4 = ["<button", " class=\"w-full text-left\">Notifications</button>"],
  _tmpl$5 = ["<button", " class=\"w-full text-left\">Messages</button>"],
  _tmpl$6 = ["<button", " class=\"w-full text-left\">Bookmarks</button>"],
  _tmpl$7 = ["<button", " class=\"w-full text-left\">Profile</button>"],
  _tmpl$8 = ["<button", " class=\"w-full text-left\">More</button>"],
  _tmpl$9 = ["<div", " class=\"relative\"><div class=\"flex-col hidden h-screen overflow-auto md:flex md:top-0 md:fixed\"><div class=\"px-4 py-8\">", "</div><nav><ul><li>", "</li><li>", "</li><li>", "</li><li>", "</li><li>", "</li><li>", "</li><li>", "</li><li>", "</li><li><div class=\"p-4\">", "</div></li></ul></nav><div class=\"flex items-center w-full gap-4 p-4 mt-auto text-sm\"><div>", "</div><div><div class=\"font-bold\">", "</div><div class=\"text-gray-400\">@<!--#-->", "<!--/--></div></div><div class=\"ml-auto\">...</div></div></div></div>"];
function Sidebar(props) {
  return ssr(_tmpl$9, ssrHydrationKey(), escape(createComponent(Logo, {})), escape(createComponent(MenuItem, {
    get children() {
      return ssr(_tmpl$$2, ssrHydrationKey());
    }
  })), escape(createComponent(MenuItem, {
    get children() {
      return ssr(_tmpl$2$1, ssrHydrationKey());
    }
  })), escape(createComponent(MenuItem, {
    get children() {
      return ssr(_tmpl$3, ssrHydrationKey());
    }
  })), escape(createComponent(MenuItem, {
    get children() {
      return ssr(_tmpl$4, ssrHydrationKey());
    }
  })), escape(createComponent(MenuItem, {
    get children() {
      return ssr(_tmpl$5, ssrHydrationKey());
    }
  })), escape(createComponent(MenuItem, {
    get children() {
      return ssr(_tmpl$6, ssrHydrationKey());
    }
  })), escape(createComponent(MenuItem, {
    get children() {
      return ssr(_tmpl$7, ssrHydrationKey());
    }
  })), escape(createComponent(MenuItem, {
    get children() {
      return ssr(_tmpl$8, ssrHydrationKey());
    }
  })), escape(createComponent(Button, {
    onClick: event => document.querySelector("#composer").focus(),
    fullWidth: true,
    children: "Tweet"
  })), escape(createComponent(Avatar, {
    get alt() {
      return props.me.name;
    },
    get url() {
      return props.me.profile_image_url;
    }
  })), escape(props.me.name), escape(props.me.username));
}

const _tmpl$$1 = ["<div", " class=\"overflow-auto\">", "</div>"],
  _tmpl$2 = ["<div", "><div class=\"flex items-start gap-4 p-4 border-t border-gray-300 dark:border-gray-700\"><div>", "</div><div class=\"grid w-full gap-2\"><div class=\"\"><div class=\"flex items-center gap-1\"><div><strong>", "</strong> <span class=\"text-gray-500\">@<!--#-->", "<!--/-->\xB7 <!--#-->", "<!--/--></span></div><div class=\"ml-auto\">...</div></div></div><p class=\"text-xl leading-normal\">", "</p><div><ul class=\"flex items-center justify-between w-full gap-2 mt-2\"><li><button>\uD83D\uDCAC</button></li><li><button>\u267B\uFE0F</button></li><li><button>\u2764\uFE0F</button></li><li><button>\uD83D\uDE80</button></li></ul></div></div></div></div>"];
function Timeline(props) {
  return ssr(_tmpl$$1, ssrHydrationKey(), escape(createComponent(For, {
    get each() {
      return props.timeline;
    },
    children: (tweet, _index) => {
      _index();
      return ssr(_tmpl$2, ssrHydrationKey(), escape(createComponent(Avatar, {
        get url() {
          return tweet.author.profile_image_url;
        },
        get alt() {
          return tweet.author.name;
        },
        size: 64
      })), escape(tweet.author.name), escape(tweet.author.username), escape(Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date(tweet.created_at))), escape(tweet.text));
    }
  })));
}

const _tmpl$ = ["<div", " class=\"px-4 relative h-screen md:grid gap-8 md:grid-cols-[1fr,3fr,1fr]\"><!--#-->", "<!--/--><main class=\"grid content-start border-l border-r border-gray-200 dark:border-gray-800\"><div class=\"sticky top-0 flex items-center p-4 bg-white dark:bg-black bg-opacity-70 backdrop-blur\"><div class=\"text-xl font-bold\">Home</div><div class=\"ml-auto\">...</div></div><!--#-->", "<!--/--><div>", "</div></main><!--#-->", "<!--/--></div>"];
function WholeUI(props) {
  return ssr(_tmpl$, ssrHydrationKey(), escape(createComponent(Sidebar, {
    get me() {
      return props.me;
    }
  })), escape(createComponent(Composer, {
    get me() {
      return props.me;
    },
    get token() {
      return props.token;
    }
  })), escape(createComponent(Timeline, {
    get timeline() {
      return props.timeline;
    }
  })), escape(createComponent(RightSidebar, {})));
}

const $$server_module0$1 = server$.createHandler(async function $$serverHandler0(_, {
  request
}) {
  const cookie = request.headers.get("Cookie");
  if (!cookie) {
    return {
      authenticated: false
    };
  }
  const token = JSON.parse(decodeURIComponent(parse(cookie).token) || "{}");
  if (!token) {
    return {
      authenticated: false
    };
  }
  const twitterRequestOptions = {
    headers: {
      Authorization: `Bearer ${token.value}`,
      "Content-Type": "application/json"
    }
  };
  const me = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", twitterRequestOptions).then(r => r.json()).then(r => r.data);
  console.log({
    me
  });
  if (!me) {
    return {
      authenticated: false
    };
  }
  const timeline = await fetch(`https://api.twitter.com/2/users/${me.id}/timelines/reverse_chronological?tweet.fields=created_at&expansions=author_id&user.fields=profile_image_url,id,username&max_results=100`, twitterRequestOptions).then(r => r.json()).then(r => r.data.map(tweet => ({
    ...tweet,
    author: r.includes.users.find(user => user.id === tweet.author_id)
  })));
  return {
    authenticated: true,
    token: token.value,
    expiresAt: token.expiresAt,
    me,
    timeline
  };
}, "/_m/0dbe216f23/routeData");
server$.registerHandler("/_m/0dbe216f23/routeData", $$server_module0$1);
const routeData = () => {
  return createRouteData($$server_module0$1, {
    key: "hi"
  });
};

function Home() {
  const read = useRouteData();
  const data = read();
  if (!data?.authenticated) {
    return createComponent(LoginPage, {});
  }
  return createComponent(WholeUI, {
    get me() {
      return data.me;
    },
    get timeline() {
      return data.timeline;
    },
    get token() {
      return data.token;
    }
  });
}
const $$server_module0 = server$.createHandler(async function $$serverHandler0(_, {
  request
}) {
  const cookie = request.headers.get("Cookie");
  if (!cookie) {
    return {
      authenticated: false
    };
  }
  const token = JSON.parse(decodeURIComponent(parse(cookie).token) || "{}");
  if (!token) {
    return {
      authenticated: false
    };
  }
  const twitterRequestOptions = {
    headers: {
      Authorization: `Bearer ${token.value}`,
      "Content-Type": "application/json"
    }
  };
  const me = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", twitterRequestOptions).then(r => r.json()).then(r => r.data);
  console.log({
    me
  });
  if (!me) {
    return {
      authenticated: false
    };
  }
  const timeline = await fetch(`https://api.twitter.com/2/users/${me.id}/timelines/reverse_chronological?tweet.fields=created_at&expansions=author_id&user.fields=profile_image_url,id,username&max_results=100`, twitterRequestOptions).then(r => r.json()).then(r => r.data.map(tweet => ({
    ...tweet,
    author: r.includes.users.find(user => user.id === tweet.author_id)
  })));
  return {
    authenticated: true,
    token: token.value,
    expiresAt: token.expiresAt,
    me,
    timeline
  };
}, "/_m/0dbe216f23/routeData");
server$.registerHandler("/_m/0dbe216f23/routeData", $$server_module0);

/// <reference path="../server/types.tsx" />
const fileRoutes = [{
  data: routeData,
  component: Home,
  path: "/"
}];

/**
 * Routes are the file system based routes, used by Solid App Router to show the current page according to the URL.
 */

const FileRoutes = () => {
  return fileRoutes;
};

const root = '';

function Root() {
  return createComponent(Html, {
    lang: "en",
    get children() {
      return [createComponent(Head, {
        get children() {
          return [createComponent(Title, {
            children: "SolidStart - With TailwindCSS"
          }), createComponent(Meta$1, {
            charset: "utf-8"
          }), createComponent(Meta$1, {
            name: "viewport",
            content: "width=device-width, initial-scale=1"
          })];
        }
      }), createComponent(Body, {
        "class": "dark:bg-black dark:text-white",
        get children() {
          return [createComponent(Suspense, {
            get children() {
              return createComponent(ErrorBoundary, {
                get children() {
                  return createComponent(Routes, {
                    get children() {
                      return createComponent(FileRoutes, {});
                    }
                  });
                }
              });
            }
          }), createComponent(Scripts, {})];
        }
      })];
    }
  });
}

async function streamToString(stream) {
  const chunks = [];
  let isDone = false;
  while (!isDone) {
    const result = await stream.read();
    isDone = result.done;
    if (result.value)
      chunks.push(Buffer.from(result.value));
  }
  return Buffer.concat(chunks).toString("utf-8");
}
const POST = async ({ params, request, env }) => {
  const reader = request.body.getReader();
  const { text } = JSON.parse(await streamToString(reader));
  const twitterRes = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${JSON.parse(decodeURIComponent(cookie.parse(request.headers.get("cookie")).token)).value}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text
    })
  }).then((r) => r.json());
  return json(twitterRes);
};

const GET = async ({ params, request }) => {
  const authCode = new URLSearchParams(request.url).get("code");
  const redirectUri = "http://localhost:3000/api/auth/twitter/callback";
  try {
    const token = await getToken({ authCode, redirectUri });
    return new Response("{}", {
      status: 302,
      headers: {
        "Location": "/",
        "Set-Cookie": cookie.serialize(
          "token",
          JSON.stringify({
            value: token.access_token,
            expiresAt: new Date(Date.now() + token.expires_in * 1e3)
          }),
          {
            httpOnly: true,
            maxAge: token.expires_in,
            path: "/"
          }
        )
      }
    });
  } catch (e) {
    return { error: e };
  }
};

const api = [
  {
    GET: "skip",
    path: "/"
  },
  {
    POST: POST,
    path: "/api/tweet"
  },
  {
    GET: GET,
    path: "/api/auth/twitter/callback"
  }
];
function routeToMatchRoute(route) {
  const segments = route.path.split("/").filter(Boolean);
  const params = [];
  const matchSegments = [];
  let score = route.path.endsWith("/") ? 4 : 0;
  let wildcard = false;
  for (const [index, segment] of segments.entries()) {
    if (segment[0] === ":") {
      const name = segment.slice(1);
      score += 3;
      params.push({
        type: ":",
        name,
        index
      });
      matchSegments.push(null);
    } else if (segment[0] === "*") {
      params.push({
        type: "*",
        name: segment.slice(1),
        index
      });
      wildcard = true;
    } else {
      score += 4;
      matchSegments.push(segment);
    }
  }
  return {
    ...route,
    score,
    params,
    matchSegments,
    wildcard
  };
}
const allRoutes = api.map(routeToMatchRoute).sort((a, b) => b.score - a.score);
registerApiRoutes(allRoutes);
function getApiHandler(url, method) {
  return getRouteMatches$1(allRoutes, url.pathname, method.toUpperCase());
}

const apiRoutes = ({ forward }) => {
  return async (event) => {
    let apiHandler = getApiHandler(new URL(event.request.url), event.request.method);
    if (apiHandler) {
      let apiEvent = Object.freeze({
        request: event.request,
        params: apiHandler.params,
        env: event.env,
        $type: FETCH_EVENT,
        fetch: internalFetch
      });
      try {
        return await apiHandler.handler(apiEvent);
      } catch (error) {
        if (error instanceof Response) {
          return error;
        }
        return new Response(JSON.stringify(error), {
          status: 500
        });
      }
    }
    return await forward(event);
  };
};

const inlineServerFunctions = ({ forward }) => {
  return async (event) => {
    const url = new URL(event.request.url);
    if (server$.hasHandler(url.pathname)) {
      let contentType = event.request.headers.get(ContentTypeHeader);
      let origin = event.request.headers.get(XSolidStartOrigin);
      let formRequestBody;
      if (contentType != null && contentType.includes("form") && !(origin != null && origin.includes("client"))) {
        let [read1, read2] = event.request.body.tee();
        formRequestBody = new Request(event.request.url, {
          body: read2,
          headers: event.request.headers,
          method: event.request.method,
          duplex: "half"
        });
        event.request = new Request(event.request.url, {
          body: read1,
          headers: event.request.headers,
          method: event.request.method,
          duplex: "half"
        });
      }
      let serverFunctionEvent = Object.freeze({
        request: event.request,
        fetch: internalFetch,
        $type: FETCH_EVENT,
        env: event.env
      });
      const serverResponse = await handleServerRequest(serverFunctionEvent);
      let responseContentType = serverResponse.headers.get(XSolidStartContentTypeHeader);
      if (formRequestBody && responseContentType !== null && responseContentType.includes("error")) {
        const formData = await formRequestBody.formData();
        let entries = [...formData.entries()];
        return new Response(null, {
          status: 302,
          headers: {
            Location: new URL(event.request.headers.get("referer") || "").pathname + "?form=" + encodeURIComponent(
              JSON.stringify({
                url: url.pathname,
                entries,
                ...await serverResponse.json()
              })
            )
          }
        });
      }
      return serverResponse;
    }
    const response = await forward(event);
    return response;
  };
};

const rootData = Object.values(/* #__PURE__ */ Object.assign({}))[0];
const dataFn = rootData ? rootData.default : undefined;

/** Function responsible for listening for streamed [operations]{@link Operation}. */

/** This composes an array of Exchanges into a single ExchangeIO function */
const composeMiddleware = exchanges => ({
  forward
}) => exchanges.reduceRight((forward, exchange) => exchange({
  forward
}), forward);
function createHandler(...exchanges) {
  const exchange = composeMiddleware([apiRoutes, inlineServerFunctions, ...exchanges]);
  return async event => {
    return await exchange({
      forward: async op => {
        return new Response(null, {
          status: 404
        });
      }
    })(event);
  };
}
function StartRouter(props) {
  return createComponent(Router, props);
}
const docType = ssr("<!DOCTYPE html>");
function StartServer({
  event
}) {
  const parsed = new URL(event.request.url);
  const path = parsed.pathname + parsed.search;

  // @ts-ignore
  sharedConfig.context.requestContext = event;
  return createComponent(ServerContext.Provider, {
    value: event,
    get children() {
      return createComponent(MetaProvider, {
        get tags() {
          return event.tags;
        },
        get children() {
          return createComponent(StartRouter, {
            url: path,
            get out() {
              return event.routerContext;
            },
            location: path,
            get prevLocation() {
              return event.prevUrl;
            },
            data: dataFn,
            routes: fileRoutes,
            get children() {
              return [docType, createComponent(Root, {})];
            }
          });
        }
      });
    }
  });
}

const entryServer = createHandler(renderAsync(event => createComponent(StartServer, {
  event: event
})));

export { entryServer as default };
