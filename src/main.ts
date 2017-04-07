module Base {


    import Graphics = PIXI.Graphics;
    export class Assembloid {
        private game: Phaser.Game;
        private tilemap: Phaser.Tilemap;
        private overlayMap: Phaser.Tilemap;
        private groundLayer: Phaser.TilemapLayer;
        private wallLayer: Phaser.TilemapLayer;
        private componentLayer: Phaser.TilemapLayer;
        private overlayLayer: Phaser.TilemapLayer;

        private marker: Phaser.Graphics;

        private markerWidth: number;
        private markerHeight: number;

        private plusKey: Phaser.Key;
        private minusKey: Phaser.Key;
        private componentKey1: Phaser.Key;
        private componentKey2: Phaser.Key;
        private componentKey3: Phaser.Key;
        private rotateKey: Phaser.Key;

        private components: Component[];

        private static TILE_SIZE = 32;

        private markerComponent: Component;
        private selectedComponent: Component; // Highlighted by the cursor, element of this.components

        private componentToBePlaced: Component;

        private leftClickPressed = false;

        constructor() {
            this.game = new Phaser.Game(
                480, 480,
                Phaser.AUTO,
                'content',
                this
                /*{
                    preload: this.preload,
                    create: this.create,
                    update: this.update
                }*/);

        }

        private preload() {
            this.game.load.tilemap('map', 'assets/tiles.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.tilemap('overlay', 'assets/overlay.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('assembloid_tiles', 'assets/assembloid.png');
            this.game.load.image('assembloid_overlay', 'assets/overlay.png');
        }

        private create() {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.canvas.oncontextmenu = (e: PointerEvent) => e.preventDefault();

            this.tilemap = this.game.add.tilemap('map');
            this.tilemap.addTilesetImage('assembloid_tiles');
            this.groundLayer = this.tilemap.createLayer('Ground');
            this.componentLayer = this.tilemap.createLayer('Component');
            this.wallLayer = this.tilemap.createLayer('Wall');

            this.overlayMap = this.game.add.tilemap('overlay');
            this.overlayMap.addTilesetImage('assembloid_overlay');
            this.overlayLayer = this.overlayMap.createLayer('Overlay');

            this.groundLayer.resizeWorld();


            this.markerWidth = 2;
            this.markerHeight = 2;
            this.marker = this.game.add.graphics(0, 0);


            this.components = [];

            this.plusKey = this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_ADD);
            this.minusKey = this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_SUBTRACT);

            this.componentKey1 = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE);
            this.componentKey2 = this.game.input.keyboard.addKey(Phaser.Keyboard.TWO);
            this.componentKey3 = this.game.input.keyboard.addKey(Phaser.Keyboard.THREE);

            this.rotateKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);

            this.plusKey.onDown.add(() => {
                this.markerWidth = Math.min(50, this.markerWidth + 1);
                this.markerHeight = Math.min(50, this.markerHeight + 1);
            }, this);

            this.minusKey.onDown.add(() => {
                this.markerWidth = Math.max(2, this.markerWidth - 1);
                this.markerHeight = Math.max(2, this.markerHeight - 1);
            }, this);

            this.componentKey1.onDown.add(() => {
                this.markerComponent = new Machine1();
            }, this);

            this.componentKey2.onDown.add(() => {
                this.markerComponent = new Machine2();
            }, this);

            this.componentKey3.onDown.add(() => {
                this.markerComponent = new Pipe();
            }, this);

            this.rotateKey.onDown.add(() => {
                //this.selectedComponent.rotate();
                if ( this.selectedComponent instanceof Pipe ) {
                    let direction = PipeOrientation[Math.floor(Math.random()*7)];
                    //(<Pipe>this.selectedComponent).setOrientation( Math.floor(Math.random()*7) );
                    (<Pipe>this.selectedComponent).rotate();


                    // TODO FARM THIS OUT - "drawComponent( component )"
                    let tileGraphics = this.selectedComponent.getTileGraphics();
                    _.each(tileGraphics, (row, y) => {
                        _.each(row, (tileIndex, x) => {
                            let tileX = (this.marker.x / Assembloid.TILE_SIZE) + x;
                            let tileY = (this.marker.y / Assembloid.TILE_SIZE) + y;
                            this.tilemap.putTile(tileIndex, tileX, tileY, this.componentLayer);
                        });
                    });

                }

                if ( this.markerComponent instanceof Pipe ) {
                    (<Pipe>this.markerComponent).rotate();
                }

            }, this);

            this.markerComponent = new Machine1();

        }

        private getComponentOnTile( tile : Phaser.Tile ) : Component {
            if ( !tile ) { return null; }
            return _.find( this.components, (component : Component) => {
                return component.occupies(tile);
            });
        }

        private update() {
            let activePointer = this.game.input.activePointer;
            let selectedTile = this.tilemap.getTileWorldXY(activePointer.x, activePointer.y, Assembloid.TILE_SIZE, Assembloid.TILE_SIZE, this.groundLayer);
            let selectedTiles = [];
            let canPlace = true;

            let newComponent: Component;

            this.selectedComponent = null;

            if ( !selectedTile ) {
                return;
            }

            _.each(this.components, (c: Component) => {
                if (c.occupies(selectedTile)) {
                    this.selectedComponent = c;
                }
            });

            switch ( this.markerComponent.getType() ) {
                case ComponentType.MACHINE_1:
                    newComponent = new Machine1();
                    break;
                case ComponentType.MACHINE_2:
                    newComponent = new Machine2();
                    break;
                case ComponentType.PIPE:
                    newComponent = new Pipe();
                    break;
                default:
                    return;
            }

            this.markerWidth = newComponent.getWidth();
            this.markerHeight = newComponent.getHeight();

            if (!this.selectedComponent) {

                let halfMarkerW = this.markerWidth / 2;
                let halfMarkerH = this.markerHeight / 2;

                if (halfMarkerW % 1 != 0) {
                    let markerTileX = selectedTile.x - ( (this.markerWidth - 1) / 2 );
                    this.marker.x = markerTileX * Assembloid.TILE_SIZE;
                } else {
                    let markerTileX = selectedTile.x - ( (this.markerWidth / 2) - 1 );
                    this.marker.x = markerTileX * Assembloid.TILE_SIZE;
                }

                if (halfMarkerH % 1 != 0) {
                    let markerTileY = selectedTile.y - ( (this.markerHeight - 1) / 2 );
                    this.marker.y = markerTileY * Assembloid.TILE_SIZE;
                } else {
                    let markerTileY = selectedTile.y - ( (this.markerHeight / 2) - 1 );
                    this.marker.y = markerTileY * Assembloid.TILE_SIZE;
                }

                for (let x = 0; x < this.markerWidth; x++) {
                    for (let y = 0; y < this.markerHeight; y++) {

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

                        canPlace = canPlace && !componentTile && !wallTile;
                        selectedTiles.push({x: x, y: y});

                    }
                }

            } else {
                // Tile occupied by machine, select machine
                canPlace = false;
                this.marker.x = this.selectedComponent.getX() * Assembloid.TILE_SIZE;
                this.marker.y = this.selectedComponent.getY() * Assembloid.TILE_SIZE;
                this.markerWidth =  this.selectedComponent.getWidth();
                this.markerHeight =  this.selectedComponent.getHeight();
            }


            for (let x = 0; x < this.overlayMap.width; x++) {
                for (let y = 0; y < this.overlayMap.height; y++) {
                    this.overlayMap.removeTile(x, y, this.overlayLayer);
                }
            }


            this.marker.clear();
            let markerColour = canPlace ? 0x00ff00 : 0xff0000;
            this.marker.lineStyle(2, markerColour, 1);
            this.marker.drawRect(0, 0, Assembloid.TILE_SIZE * this.markerWidth, Assembloid.TILE_SIZE * this.markerHeight);

            if (canPlace) {

                let cX = this.marker.x / Assembloid.TILE_SIZE;
                let cY = this.marker.y / Assembloid.TILE_SIZE;
                newComponent.setPosition(cX, cY);
                this.markerComponent.setPosition(cX, cY);

                // if its a pipe, figure out what it's initial rotation should be
                if ( newComponent.getType() == ComponentType.PIPE ) {

                    (<Pipe>this.markerComponent).clearConnections();

                    let tileTop = this.tilemap.getTile( selectedTile.x, selectedTile.y - 1, this.componentLayer );
                    let tileBottom = this.tilemap.getTile( selectedTile.x, selectedTile.y + 1, this.componentLayer );
                    let tileLeft = this.tilemap.getTile( selectedTile.x - 1, selectedTile.y, this.componentLayer );
                    let tileRight = this.tilemap.getTile( selectedTile.x + 1, selectedTile.y, this.componentLayer );

                    let leftComponent = this.getComponentOnTile( tileLeft );
                    let rightComponent = this.getComponentOnTile( tileRight );
                    let topComponent = this.getComponentOnTile( tileTop );
                    let bottomComponent = this.getComponentOnTile( tileBottom );

                    if ( leftComponent && leftComponent.getType() == ComponentType.PIPE && (<Pipe>leftComponent).facesDirection(PipeDirection.RIGHT) ) {
                        (<Pipe>newComponent).connect(<Pipe>leftComponent);
                        (<Pipe>this.markerComponent).connect(<Pipe>leftComponent);
                    }
                    if ( rightComponent && rightComponent.getType() == ComponentType.PIPE && (<Pipe>rightComponent).facesDirection(PipeDirection.LEFT) ) {
                        (<Pipe>newComponent).connect(<Pipe>rightComponent);
                        (<Pipe>this.markerComponent).connect(<Pipe>rightComponent);
                    }
                    if ( topComponent && topComponent.getType() == ComponentType.PIPE && (<Pipe>topComponent).facesDirection(PipeDirection.BOTTOM) ) {
                        (<Pipe>newComponent).connect(<Pipe>topComponent);
                        (<Pipe>this.markerComponent).connect(<Pipe>topComponent);
                    }
                    if ( bottomComponent && bottomComponent.getType() == ComponentType.PIPE && (<Pipe>bottomComponent).facesDirection(PipeDirection.TOP) ) {
                        (<Pipe>newComponent).connect(<Pipe>bottomComponent);
                        (<Pipe>this.markerComponent).connect(<Pipe>bottomComponent);
                    }
                }

                let tileGraphics = newComponent.getTileGraphics();
                _.each(tileGraphics, (row, y) => {
                    _.each(row, (tileIndex, x) => {
                        let tileX = (this.marker.x / Assembloid.TILE_SIZE) + x;
                        let tileY = (this.marker.y / Assembloid.TILE_SIZE) + y;
                        this.overlayMap.putTile(tileIndex, tileX, tileY, this.overlayLayer);

                        if (canPlace && activePointer.leftButton.isDown && !this.leftClickPressed ) {
                            this.tilemap.putTile(tileIndex, tileX, tileY, this.componentLayer);
                        }

                        //console.log(tileIndex + " at " + tileX + ", " + tileY + " | x:" + x + ", y:" + y + " | markerX:" + this.marker.x + ", markerY:" + this.marker.y);
                    });

                });

                if ( activePointer.leftButton.isDown && !this.leftClickPressed ) {
                    this.components.push(newComponent);
                }

                // Note if left click is pressed, stops placement happening multiple times
                this.leftClickPressed = activePointer.leftButton.isDown;
            }

        }

    }

    window.onload = () => {
        new Assembloid();
    }

}
