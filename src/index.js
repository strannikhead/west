import {Creature} from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

class Duck extends Creature {
    constructor(name = "Мирная утка", image) {
        super();
    }

    quacks() {
        console.log('Кря!');
    }

    swims() {
        console.log('Плавает как уточка!');
    }
}

class Dog extends Creature {
    constructor(name = 'Пес-бандит', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }


    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            // После мигания уменьшаем урон на 1, но не меньше 0
            continuation(Math.max(0, value - 1));
        });
    }

    // Добавим описание способности, вместе с базовым описанием
    getDescriptions() {
        return ['Получает на 1 меньше урона', ...super.getDescriptions()];
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    // Особая атака: 2 урона по всем картам противника по очереди
    attack(gameContext, continuation) {
        const {oppositePlayer} = gameContext;
        const taskQueue = new TaskQueue();

        // Мигание анимации атаки самой карты
        taskQueue.push(onDone => this.view.showAttack(onDone));

        // Атака по каждой карте противника в порядке слева направо
        for (let position = 0; position < oppositePlayer.table.length; position++) {
            const card = oppositePlayer.table[position];
            if (card) {
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                });
            }
        }

        taskQueue.continueWith(continuation);
    }

    getDescriptions() {
        return [
            'Атакует всех противников на столе по 2 урона',
            ...super.getDescriptions()
        ];
    }
}

export default Gatling;

class Lad extends Dog {
    constructor() {
        super('Браток');
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    doAfterComingIntoPlay() {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
    }

    doBeforeRemoving() {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
    }

    static getBonus() {
        const quantity = this.getInGameCount();
        return quantity * (quantity + 1) / 2;
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(Math.max(0, this.getBonus()));
    }

    modifyTakenDamage(value, toCard, gameContext, continuation) {
        continuation(Math.max(0, this.getBonus()));
    }

    getDescriptions() {
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')) {
            return [
                'Чем их больше, тем они сильнее',
                ...super.getDescriptions()
            ];
        } else {
            return super.getDescriptions();
        }
    }
}


// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
export function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}


const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Lad(),
    new Lad(),
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
