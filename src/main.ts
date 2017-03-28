module Base {

    export class Main {
        private game : Phaser.Game;

        constructor() {
            this.game = new Phaser.Game(
                800, 600,
                Phaser.AUTO,
                'content',
                {
                    preload : this.preload,
                    create : this.create,
                    update : this.update
                })
        }

        private preload() {

        }

        private create() {

        }

        private update() {

        }

    }

    window.onload = () => {
        new Main();
    }

}
