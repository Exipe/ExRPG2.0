
export type WindowPosition = {
    visible: boolean;
    x: number;
    y: number;
    z: number;
};

export type WindowModel = {
    id: string;
    title: string;
    body: React.ReactElement;
    position: WindowPosition;
};