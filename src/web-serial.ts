import {DocumentModel} from "./models/document.model";
import {parse} from "./mrz-parser"

export interface Options {
    baudRate: number,
    bufferSize?: number,
    dataBits?: number,
    flowControl?: string,
    parity?: string,
    stopBits?: number
}

export class Reader {
    private portOpen = false;
    private holdPort = null;
    private port;
    private reader;
    private dataFromReader: string = '';
    private readonly options: Options | undefined;
    private readonly autoConnectToPredeterminedDevice: number = 0;

    private defaultOptions: Options | undefined = {
        baudRate: 9600,
        bufferSize: 255,
        dataBits: 8,
        flowControl: "none",
        parity: "none",
        stopBits: 1
    }

    constructor(options?: Options, autoConnectToPredeterminedDevice?: number) {
        options ? this.options = options : this.options = this.defaultOptions;
        autoConnectToPredeterminedDevice ?
            this.autoConnectToPredeterminedDevice = autoConnectToPredeterminedDevice
            : this.autoConnectToPredeterminedDevice = 0;
    }

    async connect(): Promise<any> {
        if ('serial' in navigator) {
            try {
                if (this.portOpen) {
                    this.reader.cancel();
                    console.log("Attempt to close");
                } else {
                    return new Promise<any>((resolve) => {
                        (async () => {
                            if (this.holdPort == null) {
                                if (this.autoConnectToPredeterminedDevice > 0) {
                                    let portList = await navigator.serial.getPorts();
                                    this.port = portList[this.autoConnectToPredeterminedDevice - 1];
                                } else {
                                    this.port = await navigator.serial.requestPort();
                                }
                            } else {
                                this.port = this.holdPort;
                                this.holdPort = null;
                            }

                            await this.port.open(this.options);
                            this.portOpen = true;
                            resolve("Connected!");
                        })();
                    });
                }
            } catch (err) {
                console.error('There was an error opening the serial port:', err);
            }
        } else {
            alert("The Web Serial API is not supported by your browser");
        }
    }

    normalizeAndParseReaderResult(result: string): DocumentModel {
        return <DocumentModel>parse(result.substring(2, result.length - 2).trim().replace(/\r/, '\n'));
    }

    async readAny(): Promise<string> {
        console.log('Reading...')
        return new Promise<string>((resolve, reject) => {
            (async () => {
                const textDecoder = new TextDecoderStream();
                this.reader = textDecoder.readable.getReader();
                const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);

                this.portOpen = true;
                this.dataFromReader = '';

                while (true) {
                    const {value, done} = await this.reader.read();
                    if (done) {
                        console.log('Done reading, releasing the lock...')
                        this.reader.releaseLock();
                        resolve(this.dataFromReader);
                        break;
                    }
                    this.dataFromReader += value;
                }

                await readableStreamClosed.catch((err) => {
                    reject(err)
                });
            })();
        });
    }

    async readMrz(): Promise<DocumentModel> {
        console.log('Reading...')
        return new Promise<DocumentModel>((resolve, reject) => {
            (async () => {
                const textDecoder = new TextDecoderStream();
                this.reader = textDecoder.readable.getReader();
                const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);

                this.portOpen = true;
                let readerData = '';

                while (true) {
                    const {value, done} = await this.reader.read();
                    if (done) {
                        console.log('Done reading, releasing the lock...')
                        this.reader.releaseLock();
                        let document = this.normalizeAndParseReaderResult(readerData);
                        resolve(document);
                        break;
                    }
                    readerData += value;
                }

                await readableStreamClosed.catch((err) => {
                    reject(err);
                });
            })();
        });
    }

    async stopReading(): Promise<any> {
        console.log('Trying to cancel the reader...')
        return new Promise((resolve) => {
            (async () => {
                await this.reader.cancel();
                this.dataFromReader = '';
                resolve("Stopped reading!");
            })();
        });
    }

    async disconnect(): Promise<any> {
        console.log('Trying to disconnect...')
        return new Promise((resolve) => {
            (async () => {
                await this.port.close();
                this.portOpen = false;
                resolve("Disconnected!");
            })();
        });
    }

}
