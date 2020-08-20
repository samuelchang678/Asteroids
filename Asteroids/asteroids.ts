// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

function asteroids() {
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
  // Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.
  const svg = document.getElementById("canvas")!;
  const keydown=Observable.fromEvent<KeyboardEvent>(document,'keydown')
  const gamestats={
    lives:3,
    score:0,
    level:1
  }
  //function to conver degress to radians
  const degToRad = (deg:number) => (deg *  Math.PI )/180;

  // the mainInterval (or the main clock that ticks) of the game
  const maininterval=Observable.interval(30).map(()=>gamestats)
  const mainobservable= maininterval.takeUntil(maininterval.filter(_=>gamestats.lives==0)) 
  //function that returns the remainder, the % doesnt work in my calculations for negative numbers
  function mod(n:number, m:number) {
    return ((n % m) + m) % m;
  }
  //function that returns the hypotenus between two points, a^2 = b^2 + c^2
  function distBetweenPoints(x1:number, y1:number, x2:number, y2:number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  // fuction to remove an asteroid elem from the svg and the array
  function removearock(array:Elem[],rock:Elem){
    mainobservable.subscribe((_=>rock.elem.remove()))
    array.splice(array.indexOf(rock),1)
  }
  // fuction to remove a bullet elem from the svg and the array
  function removeabullet(array:Elem[],bullet:Elem){
    mainobservable.subscribe((_=>bullet.elem.remove()));
    array.splice(array.indexOf(bullet),1)
  }
 
  
  // make a group for the spaceship and a transform to move it and rotate it
  // to animate the spaceship you will update the transform property
  let g = new Elem(svg,'g')
  .attr("transform","translate(300 300) rotate(170)") 
    
  // create a polygon shape for the space ship as a child of the transform group
  let ship = new Elem(svg, 'polygon', g.elem) 
    .attr("points","-15,20 15,20 0,-20")
    .attr("style","fill:lime;stroke:purple;stroke-width:1")
    .attr('cx',300) 
    .attr('cy',300)
    .attr("shipspeed",7)
    .attr("angle",170)
    .attr('r',10)
    .attr("fill","lime") 
  // arrays to store the elems created in the svg
  const asteroidsarray:Elem[]=[],
  bulletsarray:Elem[]=[]  
  let asteroidobserver=Observable.fromArray(asteroidsarray),
  bulletobserver=Observable.fromArray(bulletsarray)
  //function that updates the lives of the game and reset the ship if a collision happens
  function updateandreset(ship:Elem){
    gamestats.lives -= 1
    ship
    .attr("cx", 300)
    .attr("cy", 300)
    .attr("angle",360);
    Observable.interval(1).takeUntil(Observable.interval(2)).subscribe(_=> g.attr('transform',"translate("+parseInt(ship.attr("cx"))+" "+parseInt(ship.attr("cy"))+") rotate("+parseInt(ship.attr("angle"))+")"))
  }
  //fucntion that creates an asteroid that is only removes once it collide with the ship or a bullet, the starting location and speed is random but on the edge of the svg
  function makeasteroid(){
    let asteroids=new Elem (svg,'circle')
      .attr("xspeed",(Math.random() * (+5 + 5)  -5))
      .attr("yspeed",(Math.random() * (+5 + 5)  -5))
      .attr("r",(Math.random() * (+30 - +20) + +20))
      .attr('style',"fill:#292924;stroke:white")
      .attr("cx",(Math.random() * (+600 - +500) + +500))
      .attr("cy",(Math.random() * (+600 - +500) + +500))
    asteroidsarray.push(asteroids)
    mainobservable
    // Observable.interval(100).takeUntil(maininterval.filter(()=>gamestats.lives==0))
    .map(()=>asteroids.attr("cx",mod((parseInt(asteroids.attr("cx"))+parseInt(asteroids.attr("xspeed"))),600)))
    .map(()=>asteroids.attr("cy",mod((parseInt(asteroids.attr("cy"))+parseInt(asteroids.attr("yspeed"))),600)))
    .subscribe(()=>asteroidobserver) 
  }
  //function that creates a bullet and it is on the svg for a certain amount of time, then it is removed
  function createbullet(){
    let bullet=new Elem (svg,'circle')
      .attr('r',1)
      .attr('cx',ship.attr('cx'))
      .attr('cy',ship.attr('cy'))
      .attr('fill','white')
      .attr('stroke','white')
      .attr('bulletspeed',50)
      .attr('angle',ship.attr('angle'))
      .attr("condition",1)
    bulletsarray.push(bullet)
    maininterval
    .map(()=>bullet.attr("cx",mod(Math.cos(degToRad(parseInt(bullet.attr("angle"))-90))*parseInt(bullet.attr("bulletspeed")) +parseInt(bullet.attr("cx")),600)))
    .map(()=>bullet.attr("cy",mod(Math.sin(degToRad(parseInt(bullet.attr("angle"))-90))*parseInt(bullet.attr("bulletspeed")) +parseInt(bullet.attr("cy")),600)))
    .subscribe(()=>bulletobserver)
    Observable.interval(300)
    // .subscribe(_=>removeabullet(bulletsarray,bullet))
    .map(_=>bulletsarray.splice(bulletsarray.indexOf(bullet),1))
    .subscribe(_=>bullet.elem.remove())
  }
  // observable that detect any keydown from keyboard
  keydown.takeUntil(maininterval.filter(()=>gamestats.lives==0))
  .map((x)=>
    {if (x.keyCode==38||x.keyCode==87){
      ship.attr("cx",mod(Math.cos(degToRad(parseInt(ship.attr("angle"))-90))*parseInt(ship.attr("shipspeed")) +parseInt(ship.attr("cx")),600))
      ship.attr("cy",mod(Math.sin(degToRad(parseInt(ship.attr("angle"))-90))*parseInt(ship.attr("shipspeed")) +parseInt(ship.attr("cy")),600))
    }
    else if(x.keyCode==37||x.keyCode==65){
      ship.attr('angle',mod((parseInt(ship.attr('angle'))-10),360))
    }
    else if (x.keyCode==39||x.keyCode==68){
      ship.attr('angle',mod((parseInt(ship.attr('angle'))+10),360))
    }
    else if (x.keyCode==32){
      createbullet()
    }
  })
  .subscribe(()=> g.attr('transform',"translate("+parseInt(ship.attr("cx"))+" "+parseInt(ship.attr("cy"))+") rotate("+parseInt(ship.attr("angle"))+")"))


  // using observable as a loop to fill the place with asteroids
  const asteroidobservable=Observable.interval(1);
  asteroidobservable.takeUntil(asteroidobservable.filter(i=>i==10+gamestats.level))
  .subscribe(_=>makeasteroid())

  //interval to dectect collision between ship and asteroids
  Observable.interval(100).takeUntil(maininterval.filter(()=>gamestats.lives==0))
  // maininterval
  .map(_=>{for(var i=0;i<asteroidsarray.length;i++){
    if ((distBetweenPoints(parseInt(ship.attr("cx")),parseInt(ship.attr("cy")),parseInt(asteroidsarray[i].attr('cx')),parseInt(asteroidsarray[i].attr('cy'))))<(parseInt(asteroidsarray[i].attr('r'))+parseInt(ship.attr('r')))){
      updateandreset(ship)
      removearock(asteroidsarray,asteroidsarray[i])
      gamestats.score+=10
    }}})
  .subscribe(_=>g.attr)
  //interval to detect collision between bullet and asteroid
  Observable.interval(10).takeUntil(maininterval.filter(()=>gamestats.lives==0))
    .map(_=>{
        for(var i=bulletsarray.length-1;i>=0;i--){
          for(var j=asteroidsarray.length-1;j>=0;j--){
            if ((distBetweenPoints(parseInt(bulletsarray[i].attr("cx")),parseInt(bulletsarray[i].attr("cy")),parseInt(asteroidsarray[j].attr('cx')),parseInt(asteroidsarray[j].attr('cy'))))<(parseInt(asteroidsarray[j].attr('r'))))
            {
            gamestats.score+=10
            removearock(asteroidsarray,asteroidsarray[j])
            removeabullet(bulletsarray,bulletsarray[i])
      }}}})
    // .subscribe(_=>g.attr)
    .subscribe(_=>bulletsarray.forEach(e=>e.attr))
  // observer to constantly display the score and lives
  Observable.interval(10).subscribe(_=>display(gamestats.lives,gamestats.score))
    
}
//impure function that  changes the score and lives left in the game
// inspiration : https://github.com/harsilspatel/pong-breakout/blob/master/src/breakout.ts
function display(lives: number,score:number) {
  document.getElementById("lives")!.innerHTML =
    lives == 0 ? `You lost! 😥` : `lives: ${lives}`;
  document.getElementById("score")!.innerHTML =`score: ${score}`

}

// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }