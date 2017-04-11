module Base {

    export class Machine1 extends Component {
        constructor() {
            super();
            this.width = 3;
            this.height = 3;
            this.type = ComponentType.MACHINE_1;
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
            this.type = ComponentType.MACHINE_2;
            this.tileGraphics =
                [
                    [4, 5, 6],
                    [12, 13, 14],
                    [12, 13, 14],
                    [20, 21, 22]
                ];
        }
    }

    export enum PipeOrientation {
        STRAIGHT_L_R,
        STRAIGHT_T_B,
        CURVE_L_T,
        CURVE_L_B,
        CURVE_R_T,
        CURVE_R_B,
        DISCONNECTED
    }

    export enum PipeDirection {
        TOP,
        BOTTOM,
        LEFT,
        RIGHT
    }

    interface PipeConnection {
        pipe: Pipe,
        direction: PipeDirection
    }

    export class Pipe extends Component {
        public orientation : PipeOrientation = PipeOrientation.STRAIGHT_L_R;
        private connections : PipeConnection[];

        constructor() {
            super();
            this.width = 1;
            this.height = 1;
            this.type = ComponentType.PIPE;
            this.tileGraphics =
                [
                    [2]
                ];
            this.connections = [];
        }

        public connect( pipe : Pipe ) : boolean {
            /*
              0_ 1_ 2_
           0 |__|__|__|
           1 |__|XX|__|
           2 |__|__|__|
            */

            //console.log("Attempting to connect " + pipe.getX() + ", " + pipe.getY() + " to " + this.getX() + ", " + this.getY())
            let validConnection = false;

            //console.log("Connecting!");
            //console.log(this.connections);
            let alreadyConnected = _.any( this.connections, (c : PipeConnection) => {
                console.log((pipe.getX() == c.pipe.getX() && pipe.getY() == c.pipe.getY())?"already connected!":"");
                return pipe.getX() == c.pipe.getX() && pipe.getY() == c.pipe.getY();
            });


            console.log("this.x: " + this.getX() + ", other.x: " + pipe.getX() );
            console.log("this.y: " + this.getY() + ", other.y: " + pipe.getY() );
            if ( this.connections.length < 2 ) {
                if (this.getY() - 1 == pipe.getY()) {
                    if (this.getX() == pipe.getX()) {
                        //coming from above
                        this.connections.push(
                            <PipeConnection>{
                                pipe: pipe,
                                direction: PipeDirection.TOP
                            }
                        );
                        validConnection = true;
                    }
                } else if (this.getY() + 1 == pipe.getY()) {
                    if (this.getX() == pipe.getX()) {
                        //coming from below
                        this.connections.push(
                            <PipeConnection>{
                                pipe: pipe,
                                direction: PipeDirection.BOTTOM
                            }
                        );
                        validConnection = true;
                    }
                } else if (this.getY() == pipe.getY()) {
                    if (this.getX() - 1 == pipe.getX()) {
                        //coming from left
                        this.connections.push(
                            <PipeConnection>{
                                pipe: pipe,
                                direction: PipeDirection.LEFT
                            }
                        );
                        validConnection = true;
                    } else if (this.getX() + 1 == pipe.getX()) {
                        //coming from right
                        this.connections.push(
                            <PipeConnection>{
                                pipe: pipe,
                                direction: PipeDirection.RIGHT
                            }
                        );
                        validConnection = true;
                    }
                }
            }

            console.log(this.connections);
            this.calculateOrientation();

            return validConnection;
        }

        public disconnect( pipe : Pipe ) {
            this.connections = _.omit( this.connections, (v, k, o) => {
                return v.getX() == pipe.getX() && v.getY() == pipe.getY();
            });
        }

        public clearConnections() {
            console.log("clearing connections");
            this.connections = [];
            this.calculateOrientation();
        }

        getOrientation() {
            return this.orientation;
        }

        public setOrientation(orientation: PipeOrientation) {
            this.orientation = orientation;
            //console.log("Setting orientation to " + PipeOrientation[orientation]);
            //console.trace();
        }

        public rotate() {
            let possibleOrientations = this.calculatePossibleOrientations();
            let newOrientation = this.orientation;
            console.log("Current orientation: " + this.orientation);
            console.log("Possible orientations: ", possibleOrientations);
            for ( let i = 0; i < possibleOrientations.length; i++ ) {

                if ( possibleOrientations[i] == this.orientation ) {
                    console.log("Current orientation found at " + i + " (" + possibleOrientations[i]);
                    newOrientation = (i+1) < possibleOrientations.length ? possibleOrientations[i+1] : possibleOrientations[0];
                }
            }

            console.log("Setting new orientation to "+ newOrientation + " on " + (this.isPlaced() ? "placed" : "unplaced") + " pipe");
            this.setOrientation(newOrientation);
            super.rotate();

        }

        public facesDirection( direction : PipeDirection ) : boolean {
            switch ( direction ) {
                case PipeDirection.TOP:
                    return this.orientation == PipeOrientation.CURVE_L_T || this.orientation == PipeOrientation.CURVE_R_T || this.orientation == PipeOrientation.STRAIGHT_T_B;
                case PipeDirection.BOTTOM:
                    return this.orientation == PipeOrientation.CURVE_L_B || this.orientation == PipeOrientation.CURVE_R_B || this.orientation == PipeOrientation.STRAIGHT_T_B;
                case PipeDirection.LEFT:
                    return this.orientation == PipeOrientation.CURVE_L_T || this.orientation == PipeOrientation.CURVE_L_B || this.orientation == PipeOrientation.STRAIGHT_L_R;
                case PipeDirection.RIGHT:
                    return this.orientation == PipeOrientation.CURVE_R_T || this.orientation == PipeOrientation.CURVE_R_B || this.orientation == PipeOrientation.STRAIGHT_L_R;
                default:
                    return false;
            }
        }

        private calculatePossibleOrientations() : PipeOrientation[] {
            //console.log(this.connections.length);
            //console.log(this.connections);
            if ( this.connections.length > 1 ) {
                // can't change direction, pipe is fixed
                return [];
            } else if ( this.connections.length == 1 ) {
                if ( this.connections[0].direction == PipeDirection.TOP ) {
                    return [PipeOrientation.STRAIGHT_T_B, PipeOrientation.CURVE_L_T, PipeOrientation.CURVE_R_T];
                } else if ( this.connections[0].direction == PipeDirection.BOTTOM ) {
                    return [PipeOrientation.STRAIGHT_T_B, PipeOrientation.CURVE_L_B, PipeOrientation.CURVE_R_B];
                } else if ( this.connections[0].direction == PipeDirection.LEFT ) {
                    return [PipeOrientation.STRAIGHT_L_R, PipeOrientation.CURVE_L_T, PipeOrientation.CURVE_L_B];
                } else if ( this.connections[0].direction == PipeDirection.RIGHT ) {
                    return [PipeOrientation.STRAIGHT_L_R, PipeOrientation.CURVE_R_T, PipeOrientation.CURVE_R_B];
                }
            } else {
                // no connections, can either rotate top/bottom or left/right
                return [PipeOrientation.STRAIGHT_L_R, PipeOrientation.STRAIGHT_T_B]
            }

            return [];
        }

        private calculateOrientation() {

            let hasTopConnection = false,
                hasBottomConnection = false,
                hasLeftConnection = false,
                hasRightConnection = false;

            _.each( this.connections, (c : PipeConnection) => {
                hasTopConnection = hasTopConnection || c.direction == PipeDirection.TOP;
                hasBottomConnection = hasBottomConnection || c.direction == PipeDirection.BOTTOM;
                hasLeftConnection = hasLeftConnection || c.direction == PipeDirection.LEFT;
                hasRightConnection = hasRightConnection || c.direction == PipeDirection.RIGHT;
            });

            if ( hasTopConnection ) {
                if ( hasBottomConnection ) {
                    this.setOrientation( PipeOrientation.STRAIGHT_T_B );
                } else if ( hasLeftConnection ) {
                    this.setOrientation( PipeOrientation.CURVE_L_T );
                } else if ( hasRightConnection ) {
                    this.setOrientation( PipeOrientation.CURVE_R_T );
                } else {
                    this.setOrientation( PipeOrientation.STRAIGHT_T_B );
                }
            } else if ( hasBottomConnection ) {
                if ( hasLeftConnection ) {
                    this.setOrientation( PipeOrientation.CURVE_L_B );
                } else if ( hasRightConnection ) {
                    this.setOrientation( PipeOrientation.CURVE_R_B );
                } else {
                    this.setOrientation( PipeOrientation.STRAIGHT_T_B );
                }
            } else {
                this.setOrientation( PipeOrientation.STRAIGHT_L_R );
            }


            /*// todo refactor this fucking disgusting mess
            if ( this.connections.length > 1 ) {
                if ( _.any( this.connections, c => c.direction == PipeDirection.TOP ) ) {
                    if ( _.any( this.connections, c => c.direction == PipeDirection.BOTTOM ) ) {
                        this.setOrientation( PipeOrientation.STRAIGHT_T_B );
                    } else if ( _.any( this.connections, c => c.direction == PipeDirection.LEFT ) ) {
                        this.setOrientation( PipeOrientation.CURVE_L_T );
                    } else if ( _.any( this.connections, c => c.direction == PipeDirection.RIGHT ) ) {
                        this.setOrientation( PipeOrientation.CURVE_R_T );
                    }
                } else if ( _.any( this.connections, c => c.direction == PipeDirection.BOTTOM ) ) {
                    if ( _.any( this.connections, c => c.direction == PipeDirection.LEFT ) ) {
                        this.setOrientation( PipeOrientation.CURVE_L_B );
                    } else if ( _.any( this.connections, c => c.direction == PipeDirection.RIGHT ) ) {
                        this.setOrientation( PipeOrientation.CURVE_R_B );
                    }
                } else if ( _.any( this.connections, c => c.direction == PipeDirection.LEFT ) ) {
                    if ( _.any( this.connections, c => c.direction == PipeDirection.RIGHT ) ) {
                        this.setOrientation( PipeOrientation.STRAIGHT_L_R );
                    }
                }
            } else if ( this.connections.length == 1 ) {
                switch( this.connections[0].direction ) {
                    case PipeDirection.TOP:
                        this.setOrientation( PipeOrientation.STRAIGHT_T_B );
                        break;
                    case PipeDirection.BOTTOM:
                        this.setOrientation( PipeOrientation.STRAIGHT_T_B );
                        break;
                    case PipeDirection.LEFT:
                        this.setOrientation( PipeOrientation.STRAIGHT_L_R );
                        break;
                    case PipeDirection.RIGHT:
                        this.setOrientation( PipeOrientation.STRAIGHT_L_R );
                        break;
                    default:
                        this.setOrientation( PipeOrientation.DISCONNECTED );
                        break;
                }
            }*/

            //console.log("Orientation changed to " + PipeOrientation[this.orientation]);
        }

        public getTileGraphics(): number[][] {
            switch (this.orientation) {
                case PipeOrientation.STRAIGHT_L_R:
                    return [[2]];
                case PipeOrientation.STRAIGHT_T_B:
                    return [[9]];
                case PipeOrientation.CURVE_L_T:
                    return [[19]];
                case PipeOrientation.CURVE_L_B:
                    return [[3]];
                case PipeOrientation.CURVE_R_T:
                    return [[17]];
                case PipeOrientation.CURVE_R_B:
                    return [[1]];
                case PipeOrientation.DISCONNECTED:
                    return [[2]];
                default:
                    return null;
            }
        }

    }


}