module Base {

    export enum ComponentType {
        PIPE,
        MACHINE_1,
        MACHINE_2,
    }

    export class Component {

        // x, y of top-left corner in tiles
        private x: number;
        private y: number;

        // w/h in tiles
        //private width: number;
        //private height: number;

        protected tileLayout: number[][];
        protected tileGraphics: number[][];

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        public getTileGraphics() : number[][] {
            return this.tileGraphics;
        }

    }

}