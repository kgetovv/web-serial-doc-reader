import {FormatType} from "../constants/formats";
import {Details} from "../builders/createFieldParser";

export interface IDocumentModel {
    details?: Details[];
    fields?: Record<string, string>;
    format?: FormatType;
    valid?: boolean;
}

export class DocumentModel implements IDocumentModel {
    constructor(
        public details?: Details[],
        public fields?: Record<string, string>,
        public format?: FormatType,
        public valid?: boolean,
    ) {
    }
}
