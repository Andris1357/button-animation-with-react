import logo from "./logo.svg";
import "./App.css";
import {useState, useEffect} from "react";
import React from "react";

function PTimeout(func_, delay_) { //or: ßsetInterval
  return new Promise((onResolve_, onReject_) => {
    onResolve_(setTimeout(func_, delay_)); 
    onReject_(); // I: you insert the input::callable 'f' as === bc that is how it will remain a callable to be resolved by setTimeout
  })
};

function xy$Area (x, y) { //returns area, dir
  if (x >= 25 && y >= 25 && x < 175 && y < 125) { // I: inside the inner rect, {R} ß--> {25, 30, 10}
    return (0)
  }
  else {
    if ( //TD (integr): chg upper XY lim-> .boundrect() - R[2]
      (x < 25 && y > 25 && y <= 125) ||
      (x < y ? (x < 25 && y < 25) : (x == y && y < 25) || //top triangle X <=> Y!!; probably x will be greater, as in this small triangle, right offset cannot be greater than top, /1\ === 
      (y <= 150 && y >= 125 && x < 25 && ( y == -1 * (x - 150) || (y < -1 * (x - 150) && x < 150 - y ))))
    ) {
      return (1) //I: == area, dir ˇ {{0==inner, 1:4}, {left, right, up, down}}
    } 
    else if (y < 25 && (((x >= 175 && y <= 200 - x) || (x < 25 && y <= x)) ? true : x >= 25 && x < 175)) {
      return (2) // I: is it in the central rect of area2 or at an X of one of the side triangles?
    } 
    else if (
      x >= 175 && (y >= 25 && y < 125 
        ? true 
        : (y < 25 && y >= 200 - x && x >= 200 - y) || (y >= 125 && y >= x - 50 && x >= y + 50))
    ) {
      return (3)
    } 
    else if (
      y > 125 && (x >= 25 && x < 175 
        ? true 
        : (x < 25 && y >= 150 - x && x >= 150 - y) || (x >= 175 && x < 200 - (150 - y) && y > 200 - y))
    ) {
      return (4)
    } 
    else {
      return (-1)
    }
  }
};

function xy$R (x, y, in_grad_r) { //° 10 ms, ne folyamatosan
  // TD: slowly incr by setting timeouts if pos w/i inner rect | cancel promises & start --ing {R}-> get closer to {R}' === ßpos$R(XY)
    // ßsetRadius(=>) sh ° minimize the /| btw {R} & {R}' -> |1\ fire |\ ~ !=; {R} = ->| {0,10,0}
  var dir, input
  var area = xy$Area(x, y)
  switch (area) {
    case 0: 
      dir = 0; 
      input = "none"; 
      break;
    case 1: 
      dir = -1; 
      input = "x"; 
      break;
    case 2: 
      dir = -1; 
      input = "y"; 
      break;
    case 3: 
      dir = 1; 
      input = "x"; 
      break;
    case 4: 
      dir = 1; 
      input = "y"; 
      break;
    default: //console.log(`incorrect parameter of area = ${area} provided`)
  }
  //currently static <-> rect size -> TD ~
  var xy_R = [], expansion_extent, res_dR = [0,0,0], r_muls = [1, 1.25, 2.5] //I: == #of iter-s btw fully shrunk|expanded = {-500 |->| +500} -> TD: ß= {R} <= {x,y}
  if (input == "none") {
    xy_R = [25, 30, 10]
  } 
  else if (input == "x") {
    xy_R = area == 3 ? [200 - x, (200 - x) / 1.25, (200 - x) / 2.5] : [x, x / 1.25, x / 2.5]
  } 
  else {
    xy_R = area == 4 ? [150 - y, (150 - y) / 1.25, (150 - y) / 2.5] : [y, y / 1.25, y / 2.5]
  }

  if (([0,1,2].map(x => xy_R[x] != in_grad_r[x])).some(x2 => x2)) { // I: check /\ {R} is × at appr. levels -> if not, yield one iter of getting {R} closer
    return ([0,1,2].map(x => (xy_R[x] - in_grad_r[x]) / r_muls[x] + in_grad_r[x]))
  }
  else {
    return (in_grad_r)
  } // I: if {R} is appr., return ===
}

const $ = id => document.getElementById(id)
let d_xy, newl = '\n'

function gradStyle(x, y, r_cent2, r2, origo, rgba_ = "100, 30, 70, 1") {
	  return `radial-gradient(circle at ${x}px ${y}px,  rgba(0,0,0,0) ${origo}%,  rgba(${rgba_}) ${r_cent2}%,  rgba(0, 0, 0, 0) ${r2}%)`
}

const default_animation_state = {
  x_coordinate: 0, y_coordinate: 0,
  radiuses: [25, 30, 10],
  color: "200, 0, 0, 1"
}

function reduceAnimation (state_, action_) {
  switch (action_.type) {
    case "increment": // TD: in case of ßincr ~ sh× accept coord pars, /1\ ß ßinit
      return {...state_, 
        radiuses: state_.radiuses.map(
          rad_ => rad_ + action_.radius_increments // TD: change to dynamic vals [<=] wh rad is iterated
        )
      }
    case "reset": // set to `undefined` when ßoverride period expires #> ~ prob ×necess <- ×having to ask about it
      return default_animation_state
    case "initialize": // set on click as base to incr fr then on
      return {...state_, 
        x_coordinate: action_.coordinates[0],
        y_coordinate: action_.coordinates[1],
        radiuses: default_animation_state.radiuses
      }
  }
}
// TD>ST: rem coord setting ß ß'incr' ->
function App() {
	const [mouseXY, setMouseXY] = useState([undefined, undefined]) 
  const [mouseXY2, setMouseXY2] = useState([undefined, undefined])
  const [style_hook, injectStyle] = useState("")
  const [style_hook2, injectStyle2] = useState("");//gradCSS; gradBackgStyle(150, 100, 10, 33)
  const [stats, updateStats] = useState([0, false]) 
  const [within_rect, updateWithinRect2] = useState(false) //includes array of states: cursor_entered, expansion_state{1:fully expanded,0:}
  const [grad_radius, setRadius] = useState([0, 10, 0])
  
  const [click_origin, setClickOrigin] = useState([0,  0])
  const [animation_override, setAnimationOverride] = useState(false) // I: when 
  const [style_when_clicked, saveStyleWhenClicked] = useState([75, 100, 10, 25, 30, "200, 0, 0, 1"]) // TD: rem

  const [animation_state, dispatchAnimation] = React.useReducer(
    reduceAnimation, default_animation_state
  )

  useEffect(() => {
    if (stats[0] === 1 && !stats[1]) { // TD: while entered==1 & {R}<has_exp; sh× stop on mousemove stopped!
      var cycle = 500 //last resort: give scalar vals to Rs \- dyn |-\ TD: track # of timeouts fired
      console.log(stats[1], "grow") //IT CAN OCCUR TWICE BC TIMEOUT HAS NOT BEEN CALLED YET! ONCE FUNC SH BE A SOL
      for (var i = cycle; i > 0; i--) { // TD: maybe I sh wrap cond-s in the loop & always ask whet cursor is nearing edges / going swhere else \ try ~= ~
        let i_centdiff = 25, i_rdiff = 20, i_origodiff = 5 //switch loop to while! -> expand upon hovering over & not |1\ || moving
        PTimeout(() => { // TD: switch to ß= these dyn-y based on distX|Y, here w/i assigmnent line
          setRadius(prev_Rs => [
            prev_Rs[0] + i_centdiff / cycle, prev_Rs[1] + i_rdiff / cycle, //TD add incrPC here
            (i > cycle / 2 ? 0 : prev_Rs[2] + i_origodiff / (cycle / 2))
          ])
        }, 20).then(
          void function () {}
        ) // TD: for some reason I cannot modify the speed of expansion by chg-g settimeout ms val
      } //seems like it does not await the func desp the call
      updateStats(prev => [prev[0], true]) // ! initially ~ will |1\ work after expanding anim has finished \ lets see what happens ˇ th case [+]
    };// console.log(grad_radius) //appears w init val = chgs are managed via promises
    if (stats[0] === 0) {
      setRadius(() => [0, 10, 0])
    }
  }, [stats])

  return (
    <div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
					Learn React
				</a>
				<div className="grad">{xy$Area(mouseXY[0], mouseXY[1])}</div>
				<div id="grad_rerender" style={{width: "200px", height: "150px", fontSize: "medium", backgroundColor: "green"}} /*onMouseMove = {
            e => console.log([e.clientX - e.target.offsetLeft, e.clientY - e.target.offsetTop + document.getElementsByTagName("html")[0].scrollTop]) // SIMPLE SCROLLTOP DOES NOT CHANGE THE BEHAVIOUR
          } */
        >{`${grad_radius}${newl}${stats}${newl}${xy$R(mouseXY[0], mouseXY[1], grad_radius)}`}
        </div>
				<div style={{height: "50px", width: "300px"}} onMouseOver={e => console.log(e)}>{style_hook}</div>
				
        <div className = "dynamic_grad" style={{width: "200px", height: "150px", background: style_hook}} 
          onMouseEnter = {() => updateStats(() => [1, false])} 
          onMouseLeave = {() => updateStats(() => [0, false])} 
          onMouseMove = {e => {
            setMouseXY([e.clientX - e.target.offsetLeft, e.clientY - e.target.offsetTop])
            injectStyle(gradStyle(
              e.clientX - e.target.offsetLeft, // TD: test ßscrollLeft, is th also `+`? 
              e.clientY - e.target.offsetTop + document.getElementsByTagName("html")[0].scrollTop, 
              grad_radius[0], grad_radius[1], grad_radius[2]
            ))
          }}
        ></div>

        <div className = "final_grad" style = {{width: "200px", height: "150px", background: style_hook2}} 
          onMouseEnter = {() => updateWithinRect2(() => true)} // TD: rm?
          onMouseLeave = {() => updateWithinRect2(() => false)}
          
          // The radius of the circle grows upon clicked, except when this animation is already happening as a result of a preceding click
          onClick = {event_ => {
            setMouseXY2([
              event_.clientX - event_.target.offsetLeft, 
              event_.clientY - event_.target.offsetTop + document.getElementsByTagName("html")[0].scrollTop
            ]) // \/: seems ~ we do not even need to follow state of MouseXY w sep var -><- this is prob used ß ßsetRadius, but are we even using th here?
            setClickOrigin([
              event_.clientX - event_.target.offsetLeft + document.getElementsByTagName("html")[0].scrollLeft,
              event_.clientY - event_.target.offsetTop + document.getElementsByTagName("html")[0].scrollTop
            ]) // !: this does work
            
            setAnimationOverride(true) // !: this is set so it works for single vals #> THIS WILL NOT EVER BE SET LIKE ~
            dispatchAnimation({
              type: "initialize",
              coordinates: [
                event_.clientX - event_.target.offsetLeft, 
                event_.clientY - event_.target.offsetTop + document.getElementsByTagName("html")[0].scrollTop
              ] // ?: animation origin is set to an earlier pos th what was clicked <- \/ is ~ bc Promises interrupting the update of pos?
            }); console.log(`init:${animation_state.x_coordinate}`) // D: ßinitialize --> ßincr --> ßreset || first try only incr-g many times
            for (var i = 0; i < 1000; i++) { // TD: init sh occur before loop || ß'incr' sh× set coords -> have ß'init' set it & validate before chg-g ß'incr'
              PTimeout (() => {
                dispatchAnimation({
                  type: "increment", 
                  radius_increments : 0.05
                }) // TD: \/ ß.then would make them execute ×instantly
                injectStyle2(gradStyle( // injectStyle2 \- ßlog
                  animation_state.x_coordinate, 
                  animation_state.y_coordinate,
                  animation_state.radiuses[0], 
                  animation_state.radiuses[1], 
                  animation_state.radiuses[2], 
                  animation_state.color
                )) // D: it does disappear after the delay, returns when ßonMouseMove is invoked again
                //console.log(`${style_hook2}\n`, animation_state.x_coordinate, `\n${animation_state.radiuses}`)
              }, 5 * (i + 1)).then( // !: having increased gap btw timeout arrivals still did not make grad grow smoothly
                void function () {} // ?: redundant?
              ) // D: works \ grows too fast & doesnt reset radiuses to init vals
            }
            // !: std anim is flicking btw arriving promises [||] click anim <- ßoverride is not set -> move ßset before click anim loop
              // !>UPDATE: it is still flicking desp having ßset ßoverride moved --> NOW IT DOESNT \ why?
            if (!animation_override) { // TD: make this recognize, /\ the anim. is not happening at the moment
              console.log(`archived style\n${animation_override}`) // !: ~ executes
              new Promise((onResolve_, onReject_) => { // !: this P doesnt arrive
                onResolve_(setTimeout(function () {
                  console.log(`override unset\nsaved style before reset:\n${style_when_clicked}`) // I: op::logging does not inhibit async ones & gets pushed back w/i the stack
                  /*dispatchAnimation({type: "reset"}); */console.log(`saved style after reset:\n${style_when_clicked}`) // ?: \/ React hooks happen instantaneuosly? th would expl [?] it ° prints #| it occurs instantaneously when not using ß.then|ßawait
                  setAnimationOverride(false)
                }, 1500)); // !: it finishes earlier th waiting for 500 * 0.002 sec delayed promises does <- it also performs other ops
                onReject_(() => {
                  "error during execution of Promise"
                })
              })
            }
            console.log(`${click_origin}\n${animation_override}`) // TD: block animation w a promise th sets back ßanim_overr after 2 seconds
          }}

          onMouseMove = {e => {
            setMouseXY2([
              e.clientX - e.target.offsetLeft, 
              e.clientY - e.target.offsetTop + document.getElementsByTagName("html")[0].scrollTop
            ]) // \/: seems ~ we do not even need to follow state of MouseXY w sep var
            var changed_R = xy$R(
              e.clientX - e.target.offsetLeft, 
              e.clientY - e.target.offsetTop + document.getElementsByTagName("html")[0].scrollTop, 
              grad_radius // \/: either ßgrad_rad | ßchg_R is redundant here
            ) //; console.log(`style2: ${style_hook2}`, `style2_dest: ${changed_R}`)
            if (!animation_override) { // I: when click animation is not in place
              injectStyle2(gradStyle(
                e.clientX - e.target.offsetLeft, 
                e.clientY - e.target.offsetTop + document.getElementsByTagName("html")[0].scrollTop, 
                changed_R[0], changed_R[1], changed_R[2], "20, 150, 120, 1"
              )) // ?: ßovveride is not set back to false ß some reason -> doesnt anim. after click
            }
          }}
        >
          <button className="test_btn">Button</button>
        </div>
			</header>
		</div>
	);
}

export default App;
// CURRENT ITER: ->| React integrated, grad anim +>, user page created
// NEXT: text & background colors, other design chgs
// IS MOUSEXY PROJECTED AT THE CORRECT COORDS? `?:` IS THE CORRECT STRING GETTING PASSED W/I GRAD?