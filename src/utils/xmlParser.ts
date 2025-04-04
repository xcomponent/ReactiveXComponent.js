import { ParsedApiConfiguration } from '../configuration/parsedApiConfigurationTypes';

type XmlJsonNode = {
  [key: string]: XmlJsonNode | XmlJsonNode[] | string;
  _: string;
};

function xmlNodeToJson(node: Element): XmlJsonNode {
  const obj: XmlJsonNode = { _: '' };

  // Attributs
  for (const attr of Array.from(node.attributes)) {
    obj[attr.name] = attr.value;
  }

  // Enfants
  for (const child of Array.from(node.children)) {
    const tag = child.tagName;
    const childObj = xmlNodeToJson(child);
    if (obj[tag]) {
      if (!Array.isArray(obj[tag])) {
        obj[tag] = [obj[tag] as XmlJsonNode];
      }
      (obj[tag] as XmlJsonNode[]).push(childObj);
    } else {
      obj[tag] = childObj;
    }
  }

  // Texte
  const text = node.textContent?.trim();
  if (text && node.children.length === 0) {
    obj._ = text;
  }

  return obj;
}

  
export function parseXmlToJson(xml: string): ParsedApiConfiguration {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode){ throw new Error('Invalid XML')};

  const root = doc.documentElement;
  const result = { [root.tagName]: xmlNodeToJson(root) };

  return result as unknown as ParsedApiConfiguration;
}
