/**
 * CGI Project 3 - Flight Simulator
 * By LourenĂ§o Soares (54530)
 */
 
 
/*====================================
           Global Variables
====================================*/

// WebGL
var gl;
var mModelViewLoc, mModelView;
var texture;
var bitkeys = 0;

// User application options
var wireframeEnabled = false;
var viewmode = 0;

// Time variables
var StartTime;
var CurTime;
var PrevTime;

// Plane variables
var planePos = vec3(0,0,0)
var planeVelocity = 0;
var planeRotation = vec3(0,0,0);
var planeOnGround = true;

// Plane section angles
var planeElevator = 0;
var planeRudder = 0;
var planeAileron = 0;
var planePropeller = 0;

// For linear interpolation
var planeElevatorTarget = 0;
var planeRudderTarget = 0;
var planeAileronTarget = 0;


/*====================================
          Program Constants
   Change to customize the program
====================================*/

// Plane control constants
const MIN_TAKEOFFSPEED = 0.75;
const MAX_VELOCITY     = 2;
const PROPELLER_SPEED  = -20;
const LERP_SPEED       = 200;

// Map constants
const FLOOR_SIZE = 1000;

// Camera constants
const CAMERA_DIST = -10;
const CAMERA_TILT = 20;
const CAMERA_ZOOM = 5;

// Key bitmap constants. Don't touch
const BITKEY_W = 0x01;
const BITKEY_A = 0x02;
const BITKEY_S = 0x04;
const BITKEY_D = 0x08;
const BITKEY_Q = 0x10;
const BITKEY_E = 0x20;
const BITKEY_R = 0x40;
const BITKEY_F = 0x80;

// Other constants. Don't touch.
const SECOND    = 1000;


/*====================================
           Helper Functions
====================================*/

// Linearly interpolate between two values
// Argument0 - The fraction for finding the result
// Argument1 - The starting number
// Argument2 - The ending number
// Returns - The lerp'd value
function lerp(t, a, b) 
{
    return (1-t)*a + t*b;
}


/*====================================
          Controls Functions
====================================*/

// Handle key being held down
// Argument0 - The key event
function handleKeyDown(e)
{
    var key = e.key;
       
    switch (key)
    {
        case ("W"):
        case ("w"):
            bitkeys |= BITKEY_W;
            break;
        case ("A"):
        case ("a"):
            bitkeys |= BITKEY_A;
            break;
        case ("S"):
        case ("s"):
            bitkeys |= BITKEY_S;
            break;
        case ("D"):
        case ("d"):
            bitkeys |= BITKEY_D;
            break;
        case ("Q"):
        case ("q"):
            bitkeys |= BITKEY_Q;
            break;
        case ("E"):
        case ("e"):
            bitkeys |= BITKEY_E;
            break;
        case ("R"):
        case ("r"):
            bitkeys |= BITKEY_R;
            break;
        case ("F"):
        case ("f"):
            bitkeys |= BITKEY_F;
            break;
    }
}

// Handle key released
// Argument0 - The key event
function handleKeyUp(e)
{
    var key = e.key;
       
    switch (key)
    {
        case ("W"):
        case ("w"):
            bitkeys &= (~BITKEY_W);
            break;
        case ("A"):
        case ("a"):
            bitkeys &= (~BITKEY_A);
            break;
        case ("S"):
        case ("s"):
            bitkeys &= (~BITKEY_S);
            break;
        case ("D"):
        case ("d"):
            bitkeys &= (~BITKEY_D);
            break;
        case ("Q"):
        case ("q"):
            bitkeys &= (~BITKEY_Q);
            break;
        case ("E"):
        case ("e"):
            bitkeys &= (~BITKEY_E);
            break;
        case ("R"):
        case ("r"):
            bitkeys &= (~BITKEY_R);
            break;
        case ("F"):
        case ("f"):
            bitkeys &= (~BITKEY_F);
            break;
    }
}

// Handle key pressed
// Argument0 - The key event
function handleKeyPress(e)
{
    var key = e.key;
       
    switch (key)
    {
        case 'o':
        case 'O':
            wireframeEnabled = !wireframeEnabled;
            break;
        case '0':
        case '1':
        case '2':
        case '3':
            viewmode = key-'0';
    }
}


/*====================================
            Plane Functions
====================================*/

// Allow the user to contorl the plane
function controlPlane()
{
    // Up movement
    if ((bitkeys & BITKEY_W) == BITKEY_W && !planeOnGround)
    {
        planeRotation[0]--;
        planeElevatorTarget = 45;
    }
    else if ((bitkeys & BITKEY_S) == BITKEY_S && planeVelocity > MIN_TAKEOFFSPEED)
    {
        planeRotation[0]++;
        planeElevatorTarget = -45;
    }
    else
        planeElevatorTarget = 0
    planeElevator = lerp((CurTime-PrevTime)/LERP_SPEED, planeElevator, planeElevatorTarget)
    
    // Side movement
    if ((bitkeys & BITKEY_A) == BITKEY_A)
    {
        planeRotation[1]++;
        planeRudderTarget = -45;
    }
    else if ((bitkeys & BITKEY_D) == BITKEY_D)
    {
        planeRotation[1]--;
        planeRudderTarget = 45;
    }
    else
        planeRudderTarget = 0;
    planeRudder = lerp((CurTime-PrevTime)/LERP_SPEED, planeRudder, planeRudderTarget)
    
    // Rotation movement
    if ((bitkeys & BITKEY_Q) == BITKEY_Q && !planeOnGround)
    {
        planeRotation[2]++;
        planeAileronTarget = -45;
    }
    else if ((bitkeys & BITKEY_E) == BITKEY_E && !planeOnGround)
    {
        planeRotation[2]--;
        planeAileronTarget = 45;
    }
    else
        planeAileronTarget = 0;
    planeAileron = lerp((CurTime-PrevTime)/LERP_SPEED, planeAileron, planeAileronTarget);

    // Acceleration
    if ((bitkeys & BITKEY_R) == BITKEY_R && planeVelocity < MAX_VELOCITY)
        planeVelocity+=0.01;
    if ((bitkeys & BITKEY_F) == BITKEY_F && planeVelocity > -MAX_VELOCITY)
        planeVelocity-=0.01;
    planePropeller += planeVelocity*PROPELLER_SPEED;
    
    // Very basic and horrible collision detection
    if (planePos[1] < 0)
    {
        planePos[1] = 0;
        planeRotation[0] = 0;
        planeRotation[2] = 0;
        planeOnGround = true;
    }
    else if (planePos[1] != 0)
        planeOnGround = false;

    // Move the plane based on its rotation
    planePos[0] += planeVelocity*Math.sin(radians(180+planeRotation[1]))*Math.cos(radians(planeRotation[0]));
    planePos[1] += planeVelocity*Math.sin(radians(planeRotation[0]));
    planePos[2] += planeVelocity*Math.cos(radians(180+planeRotation[1]))*Math.cos(radians(planeRotation[0]));
}

// Apply some transformations to the plane
function transformPlane()
{
    // The correct approach to this would be to use quaternions, to prevent gimbal locking due to roll.
    // However, I ran out of time
    
    pushMatrix();
    
    multTranslation(planePos);
    multRotationZ(planeRotation[2]);
    multRotationY(planeRotation[1]);
    multRotationX(planeRotation[0]);
}

// Render the plane from basic shapes
function planeDraw(wgl, program, wireframe)
{
    // Apply transformations to the plane first
    transformPlane();
    
    // Body
    pushMatrix();
    multTranslation([0, 0, 0.5]);
    multRotation([-90, 0, 0]);
    multScale([1, 5, 1]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    cylinderDraw(wgl, program, wireframe)
    popMatrix();
    
    
    // Wings
    pushMatrix();
    multTranslation([0, 0, 0.4]);
    multScale([5.0, 0.1, 0.8]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    cubeDraw(wgl, program, wireframe)
    popMatrix();
    
    pushMatrix();
    multTranslation([0, 0, 0.8]);
    multRotation([planeAileron, 0, 0]);
    multTranslation([-1.5, 0, 0.1]);
    multScale([2, 0.1, 0.2]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    cubeDraw(wgl, program, wireframe)
    popMatrix();
    
    pushMatrix();
    multTranslation([0, 0, 0.8]);
    multRotation([-planeAileron, 0, 0]);
    multTranslation([1.5, 0, 0.1]);
    multScale([2, 0.1, 0.2]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    cubeDraw(wgl, program, wireframe)
    popMatrix();
    
    
    // Head
    pushMatrix();
    multTranslation([0, 0, -2])
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    sphereDraw(wgl, program, wireframe)
    popMatrix();
    
    pushMatrix();
    multTranslation([0, 0, -2.5]);
    multRotation([0, 0, planePropeller]);
    multScale([1.5, 0.1, 0.1]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    cubeDraw(wgl, program, wireframe)
    popMatrix();
    
    pushMatrix();
    multTranslation([0, 0, -2.5]);
    multRotation([0, 0, planePropeller]);
    multScale([0.1, 1.5, 0.1]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    cubeDraw(wgl, program, wireframe)
    popMatrix();
    
    
    // Butt
    pushMatrix();
    multTranslation([0, 0, 3.5]);
    multRotation([90, 0, 0]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    coneDraw(wgl, program, wireframe)
    popMatrix();
    
    pushMatrix();
    multTranslation([0, 0, 3.6]);
    multScale([2.0, 0.1, 0.8]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    cubeDraw(wgl, program, wireframe)
    popMatrix();
    
    pushMatrix();
    multTranslation([0, 0, 4.0]);
    multRotationX(planeElevator);
    multTranslation([0, 0, 0.1]);
    multScale([2.0, 0.1, 0.2]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    cubeDraw(wgl, program, wireframe)
    popMatrix();
    
    pushMatrix();
    multTranslation([0, 0.55, 3.6]);
    multScale([0.1, 1.0, 0.8]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    cubeDraw(wgl, program, wireframe)
    popMatrix();
    
    pushMatrix();
    multTranslation([0, 0.55, 4.0]);
    multRotation([0, planeRudder, 0]);
    multTranslation([0, 0, 0.1]);
    multScale([0.1, 1.0, 0.2]);
    
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    cubeDraw(wgl, program, wireframe)
    popMatrix();
    
    // Pop the matrix from the plane transformations
    popMatrix();
}


/*====================================
            Map Functions
====================================*/

// Load a texture to be used by the floor
function setupTexture() 
{
    // Create a texture.
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    // Asynchronously load an image
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "include/mario.png";
    img.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
}

// Draw the floor
function floorDraw(wgl, program, wireframe)
{
    pushMatrix();
    multTranslation([0, -0.8, 0]);
    multScale([FLOOR_SIZE, 0.1, FLOOR_SIZE]);
    
    // Draw a textured cube
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    texcubeDraw(gl, program, true);
    popMatrix();
}


/*====================================
           Camera Functions
====================================*/

// Update the canvas to fit the window
function updateCanvas()
{
    var canvas = document.getElementById("gl-canvas");
    
    // Resize the canvas and viewport
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    
    // Call the camera again to redraw
    handleView()
}

// Handle the camera
function handleView()
{
    // Get the aspect ratio
    var program = gl.getParameter(gl.CURRENT_PROGRAM);
    var w = window.innerWidth;
    var h = window.innerHeight;
    var aspect = w/h;
    
    // Setup the view
    mModelView = mat4()
    
    // Select the view based on the current mode
    var mProjection;
    if (viewmode == 0)
    {
        mModelView = mult(mModelView, translate(0,-2,CAMERA_DIST));

        mModelView = mult(mModelView, rotateX(-planeRotation[0]));
        mModelView = mult(mModelView, rotateY(-planeRotation[1]));
        mModelView = mult(mModelView, rotateZ(-planeRotation[2]));
        mModelView = mult(mModelView, translate(-planePos[0], -planePos[1], -planePos[2]));
        
        mProjection = perspective(45, aspect, 0.3, 10000);
    }
    else if (viewmode == 1)
    {
        mModelView = mult(mModelView, translate(planePos[0], -planePos[1], planePos[2]));
        mModelView = mult(mModelView, rotateY(180));
        mProjection = ortho(-1*aspect*CAMERA_ZOOM, 1*aspect*CAMERA_ZOOM, -1*CAMERA_ZOOM, 1*CAMERA_ZOOM, -100, 100);
    }
    else if (viewmode == 2)
    {
        mModelView = mult(mModelView, translate(-planePos[2], -planePos[1], planePos[0]));
        mModelView = mult(mModelView, rotateY(90));
        mProjection = ortho(-1*aspect*CAMERA_ZOOM, 1*aspect*CAMERA_ZOOM, -1*CAMERA_ZOOM, 1*CAMERA_ZOOM, -100, 100);
    }
    else if (viewmode == 3)
    {
        mModelView = mult(mModelView, translate(-planePos[0], planePos[2], 0));
        mModelView = mult(mModelView, rotateX(90+planeRotation[0]));
        mProjection = ortho(-1*aspect*CAMERA_ZOOM, 1*aspect*CAMERA_ZOOM, -1*CAMERA_ZOOM, 1*CAMERA_ZOOM, -100, 100);
    }
    
    // Get projection matrix locations
    var mProjectionLoc = gl.getUniformLocation(program, "mProjection");
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));
}


/*====================================
          Program functions
====================================*/

// Initialize the page
window.onload = function init() 
{
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    
    // Make sure WebGL is working
    if (!gl) 
        alert("WebGL isn't available");
    
    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    // Get the time
    StartTime = (new Date()).getTime();
    CurTime = StartTime;
    PrevTime = StartTime;
    
    // Initialize all the shapes
    setupTexture();
    coneInit(gl);
    cubeInit(gl);
    cylinderInit(gl);
    sphereInit(gl);
    texcubeInit(gl);
    
    // Setup event listeners
    updateCanvas()
    window.addEventListener('resize', updateCanvas);
    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Set the drawing modes
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK)

    // Render the scene
    mModelViewLoc = gl.getUniformLocation(program, "mModelView");
    render();
}


/*====================================
              Rendering
====================================*/

// Change the text on the top left
function renderText()
{
    var textElement = document.getElementById("text");
    var fps = Math.round(SECOND/(CurTime - PrevTime));
    textElement.textContent = "FPS: "+fps+"\n";
    textElement.textContent += "Pos: {"+planePos[0].toFixed(2)+", "+planePos[1].toFixed(2)+", "+planePos[2].toFixed(2)+"}\n";
    textElement.textContent += "Angle: {"+planeRotation[0].toFixed(2)+", "+planeRotation[1].toFixed(2)+", "+planeRotation[2].toFixed(2)+"}\n";
    textElement.textContent += "Velocity: "+planeVelocity.toFixed(2);
}

// Render onto the canvas
function render() 
{
    var program = gl.getParameter(gl.CURRENT_PROGRAM);
    CurTime = (new Date()).getTime()-StartTime;
    
    // Clear the framebuffer
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Setup the view
    controlPlane();
    renderText();
    handleView();
     
    // Set the active texture to the loaded image
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, "uTexture"), 0);
    
    // Draw the floor
    gl.uniform1i(gl.getUniformLocation(program, "uUseVertColor"), false);
    gl.uniform1i(gl.getUniformLocation(program, "uUseTexture"), true);
    floorDraw(gl, program, !wireframeEnabled)
    
    // Draw the plane
    gl.uniform1i(gl.getUniformLocation(program, "uUseVertColor"), true);
    gl.uniform1i(gl.getUniformLocation(program, "uUseTexture"), false);
    planeDraw(gl, program, !wireframeEnabled);
    
    // Get the time it took to render and call this function again
    PrevTime = CurTime;
    window.requestAnimFrame(render);
}
