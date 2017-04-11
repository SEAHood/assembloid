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

        //private markerComponent: Component;
        private selectedComponent: Component;
        
        private lastSelectedTileX: number;
        private lastSelectedTileY: number;

        //private currentComponent: Component;


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
                if ( this.selectedComponent.getType() != ComponentType.MACHINE_1 ) {
                    this.selectedComponent = new Machine1();
                }
            }, this);

            this.componentKey2.onDown.add(() => {
                if ( this.selectedComponent.getType() != ComponentType.MACHINE_2 ) {
                    this.selectedComponent = new Machine2();
                }
            }, this);

            this.componentKey3.onDown.add(() => {
                if ( this.selectedComponent.getType() != ComponentType.PIPE ) {
                    this.selectedComponent = new Pipe();
                }
            }, this);

            this.rotateKey.onDown.add(() => {
                if ( this.selectedComponent instanceof Pipe ) {
                    (<Pipe>this.selectedComponent).rotate();
                }
            }, this);

            this.selectedComponent = new Pipe();

        }

        private getComponentOnTile( tile : Phaser.Tile ) : Component {
            if ( !tile ) { return null; }
            return _.find( this.components, (component : Component) => {
                return component.occupies(tile);
            });
        }

        private resetSelectedComponent() {
            console.log("resetting selected component");
            switch( this.selectedComponent.getType() ) {
                case ComponentType.MACHINE_1:
                    this.selectedComponent = new Machine1();
                    break;
                case ComponentType.MACHINE_2:
                    this.selectedComponent = new Machine2();
                    break;
                case ComponentType.PIPE:
                    this.selectedComponent = new Pipe();
                    break;
                default: break;
            }
        }

        private update() {


            let activePointer = this.game.input.activePointer;
            let selectedTile = this.tilemap.getTileWorldXY(activePointer.x, activePointer.y, Assembloid.TILE_SIZE, Assembloid.TILE_SIZE, this.groundLayer);
            let canPlace = true;
            let newSelectedTile = this.lastSelectedTileX != selectedTile.x || this.lastSelectedTileY != selectedTile.y;
            let placedComponentSelectedLast = this.selectedComponent.isPlaced();


            if ( !selectedTile ) {
                return;
            }

            _.each(this.components, (c: Component) => {
                // Change tile indices for stale components
                if ( c.requiresRedraw() ) {
                    let tileGraphics = c.getTileGraphics();
                    _.each(tileGraphics, (row, y) => {
                        _.each(row, (tileIndex, x) => {
                            let tileX = (this.marker.x / Assembloid.TILE_SIZE) + x;
                            let tileY = (this.marker.y / Assembloid.TILE_SIZE) + y;
                            if ( c.isPlaced() ) {
                                this.tilemap.putTile(tileIndex, tileX, tileY, this.componentLayer);
                            } else {
                                this.overlayMap.putTile(tileIndex, tileX, tileY, this.overlayLayer);
                            }
                            //console.log(tileIndex + " at " + tileX + ", " + tileY + " | x:" + x + ", y:" + y + " | markerX:" + this.marker.x + ", markerY:" + this.marker.y);
                        });
                    });

                    c.freshenUp();
                }

                if (c.occupies(selectedTile)) {
                    canPlace = false;
                    this.selectedComponent = c;
                }
            });

            if ( placedComponentSelectedLast && canPlace ) {
                // Cursor moved from placed component to empty space, reset the selected component
                this.resetSelectedComponent();
            }

            //console.log("Selected component is " + (this.selectedComponent.isPlaced()?"placed":"not placed") + " and " + (canPlace?"can place":"cannot place"));

            this.markerWidth = this.selectedComponent.getWidth();
            this.markerHeight = this.selectedComponent.getHeight();

            if ( canPlace ) {//&& !this.selectedComponent.isPlaced() ) {

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
                let selectedComponentX = this.marker.x / Assembloid.TILE_SIZE;
                let selectedComponentY = this.marker.y / Assembloid.TILE_SIZE;
                this.selectedComponent.setPosition(selectedComponentX, selectedComponentY);

            } else {
                // Tile occupied by machine, select machine
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

                // if its a pipe, figure out what it's initial rotation should be
                if ( this.selectedComponent.getType() == ComponentType.PIPE && newSelectedTile ) {

                    (<Pipe>this.selectedComponent).clearConnections();

                    let tileTop = this.tilemap.getTile( selectedTile.x, selectedTile.y - 1, this.componentLayer );
                    let tileBottom = this.tilemap.getTile( selectedTile.x, selectedTile.y + 1, this.componentLayer );
                    let tileLeft = this.tilemap.getTile( selectedTile.x - 1, selectedTile.y, this.componentLayer );
                    let tileRight = this.tilemap.getTile( selectedTile.x + 1, selectedTile.y, this.componentLayer );

                    let leftComponent = this.getComponentOnTile( tileLeft );
                    let rightComponent = this.getComponentOnTile( tileRight );
                    let topComponent = this.getComponentOnTile( tileTop );
                    let bottomComponent = this.getComponentOnTile( tileBottom );

                    if ( leftComponent && leftComponent.getType() == ComponentType.PIPE && (<Pipe>leftComponent).facesDirection(PipeDirection.RIGHT) ) {
                        (<Pipe>this.selectedComponent).connect(<Pipe>leftComponent);
                    }
                    if ( rightComponent && rightComponent.getType() == ComponentType.PIPE && (<Pipe>rightComponent).facesDirection(PipeDirection.LEFT) ) {
                        (<Pipe>this.selectedComponent).connect(<Pipe>rightComponent);
                    }
                    if ( topComponent && topComponent.getType() == ComponentType.PIPE && (<Pipe>topComponent).facesDirection(PipeDirection.BOTTOM) ) {
                        (<Pipe>this.selectedComponent).connect(<Pipe>topComponent);
                    }
                    if ( bottomComponent && bottomComponent.getType() == ComponentType.PIPE && (<Pipe>bottomComponent).facesDirection(PipeDirection.TOP) ) {
                        (<Pipe>this.selectedComponent).connect(<Pipe>bottomComponent);
                    }
                }

                let tileGraphics = this.selectedComponent.getTileGraphics();

                // Redraw overlay item, if required
                // TODO: Don't run this if the selectedcomponent hasn't changed or something
                _.each(tileGraphics, (row, y) => {
                    _.each(row, (tileIndex, x) => {
                        let tileX = (this.marker.x / Assembloid.TILE_SIZE) + x;
                        let tileY = (this.marker.y / Assembloid.TILE_SIZE) + y;
                        this.overlayMap.putTile(tileIndex, tileX, tileY, this.overlayLayer);
                        //console.log(tileIndex + " at " + tileX + ", " + tileY + " | x:" + x + ", y:" + y + " | markerX:" + this.marker.x + ", markerY:" + this.marker.y);
                    });
                });

                // Place component into world if clicked
                if ( activePointer.leftButton.isDown && !this.leftClickPressed ) {


                    _.each(tileGraphics, (row, y) => {
                        _.each(row, (tileIndex, x) => {
                            let tileX = (this.marker.x / Assembloid.TILE_SIZE) + x;
                            let tileY = (this.marker.y / Assembloid.TILE_SIZE) + y;
                            this.tilemap.putTile(tileIndex, tileX, tileY, this.componentLayer);
                        });
                    });

                    this.selectedComponent.place();
                    this.components.push(this.selectedComponent);

                    this.resetSelectedComponent();

                    console.log("Created new component that is " + (this.selectedComponent.isPlaced() ? "placed" : "not placed"));
                    console.log(_.last(this.components).isPlaced());
                    console.log(this.components);
                }

                // Note if left click is pressed, stops placement happening multiple times
                this.leftClickPressed = activePointer.leftButton.isDown;

                this.lastSelectedTileX = selectedTile.x;
                this.lastSelectedTileY = selectedTile.y;
            }

        }

    }

    window.onload = () => {
        new Assembloid();
    }

}
