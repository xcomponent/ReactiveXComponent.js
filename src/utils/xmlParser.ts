// src/utils/xmlParser.ts
export function parseXmlToJson(xml: string): unknown {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');

    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
        throw new Error('Invalid XML');}

    function xmlNodeToJson(node: Element): unknown {
        const obj: Record<string, unknown> = {};

        // Attributs
        for (const attr of Array.from(node.attributes)) {
            obj[attr.name] = attr.value;
        }

        // Enfants
        for (const child of Array.from(node.children)) {
            const childObj = xmlNodeToJson(child);
            const key = child.tagName;
            const existing = obj[key];

            if (existing !== undefined) {
                if (Array.isArray(existing)) {
                    existing.push(childObj);
                } else {
                    obj[key] = [existing, childObj];
                }
            } else {
                obj[key] = childObj;
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
