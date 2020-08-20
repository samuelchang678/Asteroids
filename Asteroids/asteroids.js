"use strict";
function asteroids() {
    const svg = document.getElementById("canvas");
    const keydown = Observable.fromEvent(document, 'keydown');
    const gamestats = {
        lives: 3,
        score: 0,
        level: 1
    };
    const degToRad = (deg) => (deg * Math.PI) / 180;
    const maininterval = Observable.interval(30).map(() => gamestats);
    const mainobservable = maininterval.takeUntil(maininterval.filter(_ => gamestats.lives == 0));
    function mod(n, m) {
        return ((n % m) + m) % m;
    }
    function distBetweenPoints(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    function removearock(array, rock) {
        mainobservable.subscribe((_ => rock.elem.remove()));
        array.splice(array.indexOf(rock), 1);
    }
    function removeabullet(array, bullet) {
        mainobservable.subscribe((_ => bullet.elem.remove()));
        array.splice(array.indexOf(bullet), 1);
    }
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(300 300) rotate(170)");
    let ship = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:lime;stroke:purple;stroke-width:1")
        .attr('cx', 300)
        .attr('cy', 300)
        .attr("shipspeed", 7)
        .attr("angle", 170)
        .attr('r', 10)
        .attr("fill", "lime");
    const asteroidsarray = [], bulletsarray = [];
    let asteroidobserver = Observable.fromArray(asteroidsarray), bulletobserver = Observable.fromArray(bulletsarray);
    function updateandreset(ship) {
        gamestats.lives -= 1;
        ship
            .attr("cx", 300)
            .attr("cy", 300)
            .attr("angle", 360);
        Observable.interval(1).takeUntil(Observable.interval(2)).subscribe(_ => g.attr('transform', "translate(" + parseInt(ship.attr("cx")) + " " + parseInt(ship.attr("cy")) + ") rotate(" + parseInt(ship.attr("angle")) + ")"));
    }
    function makeasteroid() {
        let asteroids = new Elem(svg, 'circle')
            .attr("xspeed", (Math.random() * (+5 + 5) - 5))
            .attr("yspeed", (Math.random() * (+5 + 5) - 5))
            .attr("r", (Math.random() * (+30 - +20) + +20))
            .attr('style', "fill:#292924;stroke:white")
            .attr("cx", (Math.random() * (+600 - +500) + +500))
            .attr("cy", (Math.random() * (+600 - +500) + +500));
        asteroidsarray.push(asteroids);
        mainobservable
            .map(() => asteroids.attr("cx", mod((parseInt(asteroids.attr("cx")) + parseInt(asteroids.attr("xspeed"))), 600)))
            .map(() => asteroids.attr("cy", mod((parseInt(asteroids.attr("cy")) + parseInt(asteroids.attr("yspeed"))), 600)))
            .subscribe(() => asteroidobserver);
    }
    function createbullet() {
        let bullet = new Elem(svg, 'circle')
            .attr('r', 1)
            .attr('cx', ship.attr('cx'))
            .attr('cy', ship.attr('cy'))
            .attr('fill', 'white')
            .attr('stroke', 'white')
            .attr('bulletspeed', 50)
            .attr('angle', ship.attr('angle'))
            .attr("condition", 1);
        bulletsarray.push(bullet);
        maininterval
            .map(() => bullet.attr("cx", mod(Math.cos(degToRad(parseInt(bullet.attr("angle")) - 90)) * parseInt(bullet.attr("bulletspeed")) + parseInt(bullet.attr("cx")), 600)))
            .map(() => bullet.attr("cy", mod(Math.sin(degToRad(parseInt(bullet.attr("angle")) - 90)) * parseInt(bullet.attr("bulletspeed")) + parseInt(bullet.attr("cy")), 600)))
            .subscribe(() => bulletobserver);
        Observable.interval(300)
            .map(_ => bulletsarray.splice(bulletsarray.indexOf(bullet), 1))
            .subscribe(_ => bullet.elem.remove());
    }
    keydown.takeUntil(maininterval.filter(() => gamestats.lives == 0))
        .map((x) => {
        if (x.keyCode == 38 || x.keyCode == 87) {
            ship.attr("cx", mod(Math.cos(degToRad(parseInt(ship.attr("angle")) - 90)) * parseInt(ship.attr("shipspeed")) + parseInt(ship.attr("cx")), 600));
            ship.attr("cy", mod(Math.sin(degToRad(parseInt(ship.attr("angle")) - 90)) * parseInt(ship.attr("shipspeed")) + parseInt(ship.attr("cy")), 600));
        }
        else if (x.keyCode == 37 || x.keyCode == 65) {
            ship.attr('angle', mod((parseInt(ship.attr('angle')) - 10), 360));
        }
        else if (x.keyCode == 39 || x.keyCode == 68) {
            ship.attr('angle', mod((parseInt(ship.attr('angle')) + 10), 360));
        }
        else if (x.keyCode == 32) {
            createbullet();
        }
    })
        .subscribe(() => g.attr('transform', "translate(" + parseInt(ship.attr("cx")) + " " + parseInt(ship.attr("cy")) + ") rotate(" + parseInt(ship.attr("angle")) + ")"));
    const asteroidobservable = Observable.interval(1);
    asteroidobservable.takeUntil(asteroidobservable.filter(i => i == 10 + gamestats.level))
        .subscribe(_ => makeasteroid());
    Observable.interval(100).takeUntil(maininterval.filter(() => gamestats.lives == 0))
        .map(_ => {
        for (var i = 0; i < asteroidsarray.length; i++) {
            if ((distBetweenPoints(parseInt(ship.attr("cx")), parseInt(ship.attr("cy")), parseInt(asteroidsarray[i].attr('cx')), parseInt(asteroidsarray[i].attr('cy')))) < (parseInt(asteroidsarray[i].attr('r')) + parseInt(ship.attr('r')))) {
                updateandreset(ship);
                removearock(asteroidsarray, asteroidsarray[i]);
                gamestats.score += 10;
            }
        }
    })
        .subscribe(_ => g.attr);
    maininterval
        .map(_ => {
        for (var i = bulletsarray.length - 1; i >= 0; i--) {
            for (var j = asteroidsarray.length - 1; j >= 0; j--) {
                if ((distBetweenPoints(parseInt(bulletsarray[i].attr("cx")), parseInt(bulletsarray[i].attr("cy")), parseInt(asteroidsarray[j].attr('cx')), parseInt(asteroidsarray[j].attr('cy')))) < (parseInt(asteroidsarray[j].attr('r')))) {
                    gamestats.score += 10;
                    removearock(asteroidsarray, asteroidsarray[j]);
                    removeabullet(bulletsarray, bulletsarray[i]);
                }
            }
        }
    })
        .subscribe(_ => bulletsarray.forEach(e => e.attr));
    Observable.interval(10).subscribe(_ => display(gamestats.lives, gamestats.score));
}
function display(lives, score) {
    document.getElementById("lives").innerHTML =
        lives == 0 ? `You lost! 😥` : `lives: ${lives}`;
    document.getElementById("score").innerHTML = `score: ${score}`;
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map