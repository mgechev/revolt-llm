export const revolt = `// signal.ts - signal implementation
const context = [];
function signal(value) {
    const subscriptions = new Set();
    const read = () => {
        const running = context[context.length - 1];
        if (running) {
            subscriptions.add(running);
            running.dependencies.add(subscriptions);
        }
        return value;
    };
    const set = (nextValue) => {
        value = nextValue;
        for (const sub of [...subscriptions]) {
            sub.execute();
        }
    };
    read.set = set;
    return read;
}
function cleanup(running) {
    for (const dep of running.dependencies) {
        dep.delete(running);
    }
    running.dependencies.clear();
}
function effect(fn) {
    const execute = () => {
        cleanup(running);
        context.push(running);
        try {
            fn();
        }
        finally {
            context.pop();
        }
    };
    const running = {
        execute,
        dependencies: new Set()
    };
    execute();
}
const isElement = (node) => {
    return node.name !== undefined;
};
const isDynamicBinding = (binding) => {
    return typeof binding === 'function';
};
const isConditional = (node) => {
    return node.condition !== undefined;
};
const isIterator = (node) => {
    return node.collection !== undefined;
};
// render.ts - rendering implementation
const render = (view, root) => {
    if (isConditional(view)) {
        return renderCondition(view, root);
    }
    if (isIterator(view)) {
        return renderIterator(view, root);
    }
    if (view instanceof Array) {
        const result = [];
        for (const child of view) {
            result.push(render(child, root));
        }
        return result;
    }
    if (typeof view === "function") {
        return renderDynamicText(view, root);
    }
    return renderElement(view, root);
};
const renderDynamicText = (view, root) => {
    const node = document.createTextNode(view());
    effect(() => {
        const text = view();
        node.textContent = text;
    });
    root.append(node);
    return node;
};
const renderCondition = (view, root) => {
    let dom;
    effect(() => {
        const result = view.condition();
        if (dom) {
            destroy(dom);
        }
        if (result) {
            dom = render(view.then, root);
        }
        else if (view.else) {
            dom = render(view.else, root);
        }
    });
    return dom !== null && dom !== void 0 ? dom : [];
};
const renderIterator = (view, root) => {
    let collection = view.collection();
    let result;
    effect(() => {
        collection = view.collection();
        if (result) {
            destroy(result);
        }
        result = render(collection.map(view.items), root);
    });
    return result !== null && result !== void 0 ? result : [];
};
const renderElement = (view, root) => {
    const element = document.createElement(view.name);
    for (const attribute in view.attributes) {
        const binding = view.attributes[attribute];
        effect(() => {
            const value = binding();
            if (value === false) {
                element.removeAttribute(attribute);
                return;
            }
            element.setAttribute(attribute, value);
        });
    }
    for (const event in view.events) {
        element.addEventListener(event, view.events[event]);
    }
    element.view = view;
    root.append(element);
    if (view.children) {
        render(view.children, element);
    }
    if (view.ref) {
        view.ref(element);
    }
    return element;
};
const destroy = (node) => {
    var _a;
    if (node instanceof Array) {
        for (const child of node) {
            destroy(child);
        }
    }
    else {
        (_a = node.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(node);
        const view = node === null || node === void 0 ? void 0 : node.view;
        if (!view) {
            return;
        }
        for (const event in view.events) {
            node.removeEventListener(event, view.events[event]);
        }
    }
};`;
