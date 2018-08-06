export class Utils {
    public static removeElementFromArray<T>(array: Array<T>, element: T): void {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        } else {
            throw new Error('Element to remove not found');
        }
    }
}
