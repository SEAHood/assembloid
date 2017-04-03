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

        private components: Component[];

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

            switch (this.selectedComponent) {
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

                let halfMarkerW = componentWidth / 2;
                let halfMarkerH = componentHeight / 2;

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
                let newComponent: Component;

                switch (this.selectedComponent) {
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

                let tileGraphics = newComponent.getTileGraphics();
                _.each(tileGraphics, (row, y) => {
                    _.each(row, (tileIndex, x) => {
                        let tileX = (this.marker.x / Assembloid.TILE_SIZE) + x;
                        let tileY = (this.marker.y / Assembloid.TILE_SIZE) + y;
                        this.overlayMap.putTile(tileIndex, tileX, tileY, this.overlayLayer);

                        if (canPlace && (activePointer.leftButton.isDown || activePointer.rightButton.isDown) ) {
                            console.log("placing component");
                            this.components.push(newComponent);
                            this.tilemap.putTile(tileIndex, tileX, tileY, this.componentLayer);
                        }

                        //console.log(tileIndex + " at " + tileX + ", " + tileY + " | x:" + x + ", y:" + y + " | markerX:" + this.marker.x + ", markerY:" + this.marker.y);
                    });

                });
            }

        }

    }

    window.onload = () => {
        new Assembloid();
    }

}
