module Base {

    export class Machine1 extends Component {
        constructor() {
            super();
            this.width = 3;
            this.height = 3;
            this.tileGraphics =
                [
                    [4, 5, 6],
                    [12, 13, 14],
                    [20, 21, 22]
                ];
        }
    }

    export class Machine2 extends Component {
        constructor() {
            super();
            this.width = 3;
            this.height = 4;
            this.tileGraphics =
                [
                    [4, 5, 6],
                    [12, 13, 14],
                    [12, 13, 14],
                    [20, 21, 22]
                ];
        }
    }

    export enum PipeDirection {
        STRAIGHT_L_R,
        STRAIGHT_T_B,
        CURVE_L_T,
        CURVE_L_B,
        CURVE_R_T,
        CURVE_R_B,
        DISCONNECTED
    }
    ;

    interface PipeDirectionMatrix {
        top: number;
        bottom: number;
        left: number;
        right: number;
    }

    export class Pipe extends Component {
        public direction = PipeDirection.STRAIGHT_L_R;

        constructor() {
            super();
            this.width = 1;
            this.height = 1;
            this.tileGraphics =
                [
                    [2]
                ];
        }

        getDirection() {
            return this.direction;
        }

        public setDirection(direction: PipeDirection) {
            this.direction = direction;
        }

        public getTileGraphics(): number[][] {
            switch (this.direction) {
                case PipeDirection.STRAIGHT_L_R:
                    return [[2]];
                case PipeDirection.STRAIGHT_T_B:
                    return [[9]];
                case PipeDirection.CURVE_L_T:
                    return [[19]];
                case PipeDirection.CURVE_L_B:
                    return [[3]];
                case PipeDirection.CURVE_R_T:
                    return [[17]];
                case PipeDirection.CURVE_R_B:
                    return [[1]];
                case PipeDirection.DISCONNECTED:
                    return [[2]];
                default:
                    return null;
            }
        }

        /*private getDirectionMatrix() : PipeDirectionMatrix {
         switch( this.direction ) {
         case PipeDirection.STRAIGHT_L_R: return { top: 0, bottom: 0, left: 1, right: 1 };
         case PipeDirection.STRAIGHT_T_B: return { top: 1, bottom: 1, left: 0, right: 0 };
         case PipeDirection.CURVE_L_T:    return { top: 1, bottom: 0, left: 1, right: 0 };
         case PipeDirection.CURVE_L_B:    return { top: 0, bottom: 1, left: 1, right: 0 };
         case PipeDirection.CURVE_R_T:    return { top: 1, bottom: 0, left: 0, right: 1 };
         case PipeDirection.CURVE_R_B:    return { top: 0, bottom: 1, left: 0, right: 1 };
         case PipeDirection.DISCONNECTED: return { top: 0, bottom: 0, left: 0, right: 0 };
         default: return null;
         }
         }*/
    }


}