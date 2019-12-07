var matrixStack = [];

function pushMatrix() {
    var m =  mat4(mModelView[0], mModelView[1],
           mModelView[2], mModelView[3]);
    matrixStack.push(m);
}
function popMatrix() {
    mModelView = matrixStack.pop();
}

function multMatrix(m) {
    mModelView = mult(mModelView, m);
}
function multTranslation(t) {
    mModelView = mult(mModelView, translate(t));
}
function multScale(s) { 
    mModelView = mult(mModelView, scalem(s)); 
}
function multRotation(r) {
    mModelView = mult(mModelView, mult(rotateX(r[0]), mult(rotateY(r[1]), rotateZ(r[2]))));
}
function multRotationX(angle) {
    mModelView = mult(mModelView, rotateX(angle));
}
function multRotationY(angle) {
    mModelView = mult(mModelView, rotateY(angle));
}
function multRotationZ(angle) {
    mModelView = mult(mModelView, rotateZ(angle));
}