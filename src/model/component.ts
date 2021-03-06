module Base {

    export enum ComponentType {
        PIPE,
        MACHINE_1,
        MACHINE_2,
    }

    export class Component {

        private x: number; // x, y of top-left corner in tiles
        private y: number;
        private placed = false;
        private stale = false; // Component is stale if it's state has changed but the tiles associated have not yet been updated
        protected width: number; // w/h in tiles
        protected height: number;
        protected type: ComponentType;
        protected tileGraphics: number[][];

        constructor() {}

        public getTileGraphics(): number[][] {
            return this.tileGraphics;
        }

        public setPosition(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        public rotate() {
            this.stale = true;
        }

        public occupies(tile: Phaser.Tile): boolean {
            if ( this.x !== null && this.y !== null ) {
                for (let x = 0; x < this.width; x++) {
                    for (let y = 0; y < this.height; y++) {
                        if (tile.x == x + this.x && tile.y == y + this.y) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        public requiresRedraw() : boolean {
            return this.stale;
        }

        public freshenUp() {
            console.log("Freshening up");
            this.stale = false;
        }

        public place() {
            console.log("Placed!");
            console.trace();
            this.placed = true;
        }

        public unplace() {
            this.placed = false;
        }

        public isPlaced() : boolean {
            return this.placed;
        }

        public getWidth() : number {
            return this.width;
        }

        public getHeight() : number {
            return this.height;
        }

        public getX() : number {
            return this.x;
        }

        public getY() : number {
            return this.y;
        }

        public getType() : ComponentType {
            return this.type;
        }

    }

}