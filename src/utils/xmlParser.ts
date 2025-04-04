import { ParsedApiConfiguration } from '../configuration/parsedApiConfigurationTypes';

type XmlJsonNode = { [key: string]: string | XmlJsonNode | XmlJsonNode[] };

function xmlNodeToJson(node: Element): XmlJsonNode | string {
    const obj: XmlJsonNode = {};
  
    for (const attr of Array.from(node.attributes)) {
      obj[attr.name] = attr.value;
    }
  
    for (const child of Array.from(node.children)) {
      const key = child.tagName;
      const childObj = xmlNodeToJson(child);
  
      if (typeof childObj === 'string') {
        // On ignore les strings dans les enfants structurés
        obj[key] = childObj;
        continue;
      }
  
      if (obj[key]) {
        if (!Array.isArray(obj[key])) {
          obj[key] = [obj[key] as XmlJsonNode];
        }
        (obj[key] as XmlJsonNode[]).push(childObj);
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
  
export function parseXmlToJson(xml: string): ParsedApiConfiguration {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode){ throw new Error('Invalid XML')};

  const root = doc.documentElement;
  const result = { [root.tagName]: xmlNodeToJson(root) };

  return result as unknown as ParsedApiConfiguration;
}
