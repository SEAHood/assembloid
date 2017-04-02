module Base {


    import Graphics = PIXI.Graphics;
    export class Assembloid {
        private game: Phaser.Game;
        private tilemap: Phaser.Tilemap;
        private groundLayer: Phaser.TilemapLayer;
        private wallLayer: Phaser.TilemapLayer;
        private componentLayer: Phaser.TilemapLayer;

        private marker: Phaser.Graphics;

        private markerWidth: number;
        private markerHeight: number;

        private plusKey: Phaser.Key;
        private minusKey: Phaser.Key;
        private componentKey1: Phaser.Key;
        private componentKey2: Phaser.Key;
        private componentKey3: Phaser.Key;

        private static TILE_SIZE = 32;

        private selectedComponent: ComponentType;

        constructor() {
            this.game = new Phaser.Game(
                480, 480,
                Phaser.AUTO,
                'content',
                {
                    preload: this.preload,
                    create: this.create,
                    update: this.update
                });
        }

        private preload() {
            this.game.load.tilemap('map', 'assets/tiles.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('assembloid_tiles', 'assets/assembloid.png');
        }

        private create() {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.canvas.oncontextmenu = (e: PointerEvent) => e.preventDefault();
            this.tilemap = this.game.add.tilemap('map');
            //this.tilemap.addTilesetImage('desert', 'tiles');
            this.tilemap.addTilesetImage('assembloid_tiles');
            this.groundLayer = this.tilemap.createLayer('Ground');
            this.componentLayer = this.tilemap.createLayer('Component');
            this.wallLayer = this.tilemap.createLayer('Wall');

            //this.componentLayer = this.tilemap.createLayer('Component');
            this.groundLayer.resizeWorld();


            this.markerWidth = 2;
            this.markerHeight = 2;
            this.marker = this.game.add.graphics(0, 0);

            this.plusKey = this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_ADD);
            this.minusKey = this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_SUBTRACT);

            this.componentKey1 = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE);
            this.componentKey2 = this.game.input.keyboard.addKey(Phaser.Keyboard.TWO);
            this.componentKey3 = this.game.input.keyboard.addKey(Phaser.Keyboard.THREE);

            this.plusKey.onDown.add(() => {
                this.markerWidth = Math.min(50, this.markerWidth + 1);
                this.markerHeight = Math.min(50, this.markerHeight + 1);
            }, this);

            this.minusKey.onDown.add(() => {
                this.markerWidth = Math.max(2, this.markerWidth - 1);
                this.markerHeight = Math.max(2, this.markerHeight - 1);
            }, this);

            this.componentKey1.onDown.add(() => {
                this.selectedComponent = ComponentType.MACHINE_1;
            }, this);

            this.componentKey2.onDown.add(() => {
                this.selectedComponent = ComponentType.MACHINE_2;
            }, this);

            this.componentKey3.onDown.add(() => {
                this.selectedComponent = ComponentType.PIPE;
            }, this);

            this.selectedComponent = ComponentType.MACHINE_1;

        }

        private update() {
            let activePointer = this.game.input.activePointer;
            let selectedTile = this.tilemap.getTileWorldXY(activePointer.x, activePointer.y, Assembloid.TILE_SIZE, Assembloid.TILE_SIZE, this.groundLayer);
            let selectedTiles = [];
            let canPlace = true;

            let componentWidth = 1;
            let componentHeight = 1;

            switch( this.selectedComponent ) {
                case ComponentType.MACHINE_1:
                    componentWidth = Machine1.width;
                    componentHeight = Machine1.height;
                    break;
                case ComponentType.MACHINE_2:
                    componentWidth = Machine2.width;
                    componentHeight = Machine2.height;
                    break;
                case ComponentType.PIPE:
                    componentWidth = Pipe.width;
                    componentHeight = Pipe.height;
                    break;
                default:
                    break;
            }

            this.markerWidth = componentWidth;
            this.markerHeight = componentHeight;

            if (selectedTile) {
                let halfMarkerW = componentWidth / 2;//this.markerWidth / 2;
                let halfMarkerH = componentHeight / 2; //this.markerHeight / 2;

                if (halfMarkerW % 1 != 0) {
                    let markerTileX = selectedTile.x - ( (componentWidth - 1) / 2 );
                    this.marker.x = markerTileX * Assembloid.TILE_SIZE;
                } else {
                    let markerTileX = selectedTile.x - ( (componentWidth / 2) - 1 );
                    this.marker.x = markerTileX * Assembloid.TILE_SIZE;
                }

                if (halfMarkerH % 1 != 0) {
                    let markerTileY = selectedTile.y - ( (componentHeight - 1) / 2 );
                    this.marker.y = markerTileY * Assembloid.TILE_SIZE;
                } else {
                    let markerTileY = selectedTile.y - ( (componentHeight / 2) - 1 );
                    this.marker.y = markerTileY * Assembloid.TILE_SIZE;
                }

                for (let x = 0; x < componentWidth; x++) {
                    for (let y = 0; y < componentHeight; y++) {
                        //let wallTile =  this.tilemap.getTileWorldXY(this.marker.x + (x*32), this.marker.y + (y*32), null, null, this.wallLayer);
                        let componentTile = this.tilemap.getTileWorldXY(
                            this.marker.x + (x * Assembloid.TILE_SIZE),
                            this.marker.y + (y * Assembloid.TILE_SIZE),
                            Assembloid.TILE_SIZE,
                            Assembloid.TILE_SIZE,
                            this.componentLayer
                        );

                        let wallTile = this.tilemap.getTileWorldXY(
                            this.marker.x + (x * Assembloid.TILE_SIZE),
                            this.marker.y + (y * Assembloid.TILE_SIZE),
                            Assembloid.TILE_SIZE,
                            Assembloid.TILE_SIZE,
                            this.wallLayer
                        );
                        /*if ( wallTile ) {
                         if ( wallTile.index != 34 ) {
                         canPlace = false;
                         }
                         }*/
                        if (componentTile || wallTile) {
                            //if ( componentTile.index != null ) {
                            canPlace = false;
                            //}
                            //selectedTiles.push({x:x, y:y, t:componentTile});
                        } else {
                            // tile is empty
                        }
                        selectedTiles.push({x: x, y: y});//, t:componentTile});
                    }
                }
            }


            if (canPlace && (activePointer.leftButton.isDown || activePointer.rightButton.isDown)) {

                let cX = this.marker.x / Assembloid.TILE_SIZE;
                let cY = this.marker.y / Assembloid.TILE_SIZE;
                let newComponent : Component;

                switch( this.selectedComponent ) {
                    case ComponentType.MACHINE_1:
                        newComponent = new Machine1(cX, cY);
                        break;
                    case ComponentType.MACHINE_2:
                        newComponent = new Machine2(cX, cY);
                        break;
                    case ComponentType.PIPE:
                        newComponent = new Pipe(cX, cY);
                        break;
                    default:
                        break;
                }

                let test = "";
                let tileGraphics = newComponent.getTileGraphics();
                _.each( tileGraphics, (row, y) => {
                    _.each( row, (tileIndex, x) => {

                        test += tileGraphics[x][y] + ", ";

                        let tileX = (this.marker.x / Assembloid.TILE_SIZE) + x;
                        let tileY = (this.marker.y / Assembloid.TILE_SIZE) + y;
                        //console.log("Placing index " + tileIndex + " at " + x + ", " + y);
                        //if ( !this.tilemap.getTile(tile.x, tile.y, this.componentLayer) || this.tilemap.getTile(tile.x, tile.y, this.componentLayer).index != tileIndex ) {
                        this.tilemap.putTile(tileIndex, tileX, tileY, this.componentLayer);
                        console.log(tileIndex + " at " + tileX + ", " + tileY + " | x:" + x + ", y:" + y + " | markerX:"+this.marker.x + ", markerY:" + this.marker.y);
                    });
                    test+="\n";

                });

                console.log(test);

                /*_.each(selectedTiles, (tile) => {
                    let tileIndex: number;

                    if (activePointer.rightButton.isDown) {
                        tileIndex = 30;
                    } else {

                        if (tile.y == 0) {
                            //top row
                            if (tile.x == 0) {
                                //left
                                tileIndex = 4;
                            } else if (tile.x < this.markerWidth - 1) {
                                // mid
                                tileIndex = 5;
                            } else {
                                //right
                                tileIndex = 6;
                            }
                        } else if (tile.y < this.markerHeight - 1) {
                            //bottom row
                            if (tile.x == 0) {
                                //left
                                tileIndex = 12;
                            } else if (tile.x < this.markerWidth - 1) {
                                // mid
                                tileIndex = 13;
                            } else {
                                //right
                                tileIndex = 14;
                            }
                        } else {
                            // mid row
                            if (tile.x == 0) {
                                //left
                                tileIndex = 20;
                            } else if (tile.x < this.markerWidth - 1) {
                                // mid
                                tileIndex = 21;
                            } else {
                                //right
                                tileIndex = 22;
                            }
                        }
                    }

                    let x = (this.marker.x / Assembloid.TILE_SIZE) + tile.x;
                    let y = (this.marker.y / Assembloid.TILE_SIZE) + tile.y;
                    console.log("Placing index " + tileIndex + " at " + x + ", " + y);
                    //if ( !this.tilemap.getTile(tile.x, tile.y, this.componentLayer) || this.tilemap.getTile(tile.x, tile.y, this.componentLayer).index != tileIndex ) {
                    this.tilemap.putTile(tileIndex, x, y, this.componentLayer);
                    }
                });*/
            }

            this.marker.clear();

            let markerColour = canPlace ? 0x00ff00 : 0xff0000;
            this.marker.lineStyle(2, markerColour, 1);
            this.marker.drawRect(0, 0, Assembloid.TILE_SIZE * this.markerWidth, Assembloid.TILE_SIZE * this.markerHeight);

        }

    }

    window.onload = () => {
        new Assembloid();
    }

}
