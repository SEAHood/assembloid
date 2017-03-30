module Base {

    import Graphics = PIXI.Graphics;
    export class Main {
        private game : Phaser.Game;
        private tilemap : Phaser.Tilemap;
        private groundLayer : Phaser.TilemapLayer;
        private wallLayer : Phaser.TilemapLayer;
        private componentLayer : Phaser.TilemapLayer;

        private marker : Phaser.Graphics ;

        private markerWidth : number;
        private markerHeight : number;

        private plusKey : Phaser.Key;
        private minusKey : Phaser.Key;

        constructor() {
            this.game = new Phaser.Game(
                480, 480,
                Phaser.AUTO,
                'content',
                {
                    preload : this.preload,
                    create : this.create,
                    update : this.update
                });
        }

        private preload() {
            this.game.load.tilemap('map', 'assets/tiles.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('tiles', 'assets/tiles.png');
        }

        private create() {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.canvas.oncontextmenu = (e : PointerEvent) => e.preventDefault();
            this.tilemap = this.game.add.tilemap('map');
            this.tilemap.addTilesetImage('desert', 'tiles');
            this.groundLayer = this.tilemap.createLayer('Ground');
            this.wallLayer = this.tilemap.createLayer('Wall');
            //this.componentLayer = this.tilemap.createLayer('Component');
            this.groundLayer.resizeWorld();


            this.markerWidth = 2;
            this.markerHeight = 2;
            this.marker = this.game.add.graphics(0, 0);

            this.plusKey = this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_ADD);
            this.minusKey = this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_SUBTRACT);

            this.plusKey.onDown.add(() => {
                this.markerWidth = Math.min(50, this.markerWidth + 1);
                this.markerHeight = Math.min(50, this.markerHeight + 1);
            }, this);

            this.minusKey.onDown.add(() => {
                this.markerWidth = Math.max(2, this.markerWidth - 1);
                this.markerHeight = Math.max(2, this.markerHeight - 1);
            }, this);

        }

        private update() {
            let activePointer = this.game.input.activePointer;
            let selectedTile = this.tilemap.getTileWorldXY(activePointer.x, activePointer.y);

            let selectedTiles = [];
            let canPlace = true;


            if ( selectedTile ) {
                let halfMarkerW = this.markerWidth / 2;
                let halfMarkerH = this.markerHeight / 2;

                if ( halfMarkerW % 1 != 0 ) {
                    let markerTileX = selectedTile.x - ( (this.markerWidth - 1) / 2 );
                    this.marker.x = markerTileX * 32;
                } else {
                    let markerTileX = selectedTile.x - ( (this.markerWidth / 2) - 1 );
                    this.marker.x = markerTileX * 32;
                }

                if ( halfMarkerH % 1 != 0 ) {
                    let markerTileY = selectedTile.y - ( (this.markerHeight - 1) / 2 );
                    this.marker.y = markerTileY * 32;
                } else {
                    let markerTileY = selectedTile.y - ( (this.markerHeight / 2) - 1 );
                    this.marker.y = markerTileY * 32;
                }

                for ( let x = 0; x < this.markerWidth; x++ ) {

                    for ( let y = 0; y < this.markerHeight; y++ ) {
                        let t =  this.tilemap.getTileWorldXY(this.marker.x + (x*32), this.marker.y + (y*32));
                        if ( t ) {
                            selectedTiles.push({x:x, y:y, t:t});
                            if ( t.index != 30 ) {
                                canPlace = false;
                            }
                        }
                    }
                }

            }




            if ( canPlace && (activePointer.leftButton.isDown || activePointer.rightButton.isDown) ) {
                _.each( selectedTiles, (tile) => {
                    let tileIndex : number;

                    if ( activePointer.rightButton.isDown ) {
                        tileIndex = 30
                    } else {

                        if ( tile.y == 0 ) {
                            //top row
                            if ( tile.x == 0 ) {
                                //left
                                tileIndex = 25;
                            } else if ( tile.x < this.markerWidth - 1 ) {
                                // mid
                                tileIndex = 26;
                            } else {
                                //right
                                tileIndex = 27;
                            }
                        } else if ( tile.y < this.markerHeight - 1 ) {
                            //bottom row
                            if ( tile.x == 0 ) {
                                //left
                                tileIndex = 33;
                            } else if ( tile.x < this.markerWidth - 1 ) {
                                // mid
                                tileIndex = 34;
                            } else {
                                //right
                                tileIndex = 35;
                            }
                        } else {
                            // mid row
                            if ( tile.x == 0 ) {
                                //left
                                tileIndex = 41;
                            } else if ( tile.x < this.markerWidth - 1 ) {
                                // mid
                                tileIndex = 42;
                            } else {
                                //right
                                tileIndex = 43;
                            }
                        }
                    }

                    if ( this.tilemap.getTile(tile.t.x, tile.t.y, this.componentLayer).index != tileIndex ) {
                        this.tilemap.putTile(tileIndex, tile.t.x, tile.t.y, this.componentLayer );
                    }
                });
            }

            this.marker.clear();

            let markerColour = canPlace ? 0x00ff00 : 0xff0000;
            this.marker.lineStyle(2, markerColour, 1);
            this.marker.drawRect(0, 0, 32 * this.markerWidth, 32 * this.markerHeight);

        }

    }

    window.onload = () => {
        new Main();
    }

}
