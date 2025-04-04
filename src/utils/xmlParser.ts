export function parseXmlToJson(xml: string): unknown {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');

    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
        throw new Error('Invalid XML');
    }

    function xmlNodeToJson(node: Element): unknown {
        const obj: Record<string, unknown> = {};

        for (const attr of Array.from(node.attributes)) {
            obj[attr.name] = attr.value;
        }

        for (const child of Array.from(node.children)) {
            const childObj = xmlNodeToJson(child);
            if (obj[child.tagName]) {
                if (!Array.isArray(obj[child.tagName])) {
                    obj[child.tagName] = [obj[child.tagName]];
                }
                (obj[child.tagName] as unknown[]).push(childObj);

            } else {
                obj[child.tagName] = childObj;
            }
        }

        const text = node.textContent?.trim();
        if (text && node.children.length === 0 && node.attributes.length === 0) {
            return text;
        }

        return obj;
    }

    const root = doc.documentElement;
    return { [root.tagName]: xmlNodeToJson(root) };
}
