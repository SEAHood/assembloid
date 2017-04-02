module Base {

    export class Machine1 extends Component {
        public static width = 3;
        public static height = 3;
        constructor(x: number, y: number) {
            super(x, y);
            this.tileGraphics =
                [
                    [4, 5, 6],
                    [12, 13, 14],
                    [20, 21, 22]
                ];
        }
    }

    export class Machine2 extends Component {
        public static width = 3;
        public static height = 4;
        constructor(x: number, y: number) {
            super(x, y);
            this.tileGraphics =
                [
                    [4, 5, 6],
                    [12, 13, 14],
                    [12, 13, 14],
                    [20, 21, 22]
                ];
        }
    }

    export class Pipe extends Component {
        public static width = 1;
        public static height = 1;
        constructor(x: number, y: number) {
            super(x, y);
            this.tileGraphics =
                [
                    [9]
                ];
        }
    }


}