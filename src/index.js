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


// Колода Шерифа, нижнего игрока.
// const seriffStartDeck = [
//     new Duck(),
//     new Duck(),
//     new Duck(),
// ];
// const banditStartDeck = [
//     new Dog(),
// ];
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Trasher(),
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
