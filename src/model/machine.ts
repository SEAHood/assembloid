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
    };

    interface PipeConnections {
        top: Pipe;
        bottom: Pipe;
        left: Pipe;
        right: Pipe;
    }

    export class Pipe extends Component {
        public direction : PipeDirection = PipeDirection.STRAIGHT_L_R;
        private connections : PipeConnections;

        constructor() {
            super();
            this.width = 1;
            this.height = 1;
            this.tileGraphics =
                [
                    [2]
                ];
        }

        public connect( pipe : Pipe ) : boolean {
            /*
              0_ 1_ 2_
           0 |__|__|__|
           1 |__|XX|__|
           2 |__|__|__|
            */

            let validConnection = false;

            if ( pipe.getY() - 1 == this.getY() ) {
                if ( pipe.getX() == this.getX() ) {
                    //coming from above
                    this.connections.top = pipe;
                    validConnection = true;
                }
            } else if ( pipe.getY() == this.getY() ) {
                if ( pipe.getX() - 1 == this.getX() ) {
                    //coming from left
                    this.connections.left = pipe;
                    validConnection = true;
                } else if ( pipe.getX() + 1 == this.getX() ) {
                    //coming from right
                    this.connections.right = pipe;
                    validConnection = true;
                }
            } else if ( pipe.getY() + 1 == this.getY() ) {
                if ( pipe.getX() == this.getX() ) {
                    //coming from below
                    this.connections.bottom = pipe;
                    validConnection = true;
                }
            }

            return validConnection;
        }

        public disconnect( pipe : Pipe ) {
            this.connections = _.omit( this.connections, (v, k, o) => {
                return v.getX() == pipe.getX() && v.getY() == pipe.getY();
            });
        }

        getDirection() {
            return this.direction;
        }

        public setDirection(direction: PipeDirection) {
            this.direction = direction;
        }

        private calculatePossibleDirections() : PipeDirection[] {
            let connections = _.pairs(this.connections);

            if ( connections.length > 1 ) {
                // can't change direction, pipe is fixed
                return [];
            } else if ( connections.length == 1 ) {
                if ( this.connections.top ) {
                    return [PipeDirection.STRAIGHT_T_B, PipeDirection.CURVE_L_T, PipeDirection.CURVE_R_T];
                } else if ( this.connections.bottom ) {
                    return [PipeDirection.STRAIGHT_T_B, PipeDirection.CURVE_L_B, PipeDirection.CURVE_R_B];
                } else if ( this.connections.left ) {
                    return [PipeDirection.STRAIGHT_L_R, PipeDirection.CURVE_L_T, PipeDirection.CURVE_L_B];
                } else if ( this.connections.right ) {
                    return [PipeDirection.STRAIGHT_L_R, PipeDirection.CURVE_R_T, PipeDirection.CURVE_R_B];
                }
            } else {
                // no connections, can either rotate top/bottom or left/right
                return [PipeDirection.STRAIGHT_L_R, PipeDirection.STRAIGHT_T_B]
            }

            return [];
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

    }


}