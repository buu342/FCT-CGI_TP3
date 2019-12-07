texcube_vertices = [
    vec3(-0.5, -0.5, +0.5),     // 0
    vec3(+0.5, -0.5, +0.5),     // 1
    vec3(+0.5, +0.5, +0.5),     // 2
    vec3(-0.5, +0.5, +0.5),     // 3
    vec3(-0.5, -0.5, -0.5),     // 4
    vec3(+0.5, -0.5, -0.5),     // 5
    vec3(+0.5, +0.5, -0.5),     // 6
    vec3(-0.5, +0.5, -0.5)      // 7
];

var texcube_points = [];
var texcube_normals = [];
var texcube_faces = [];
var texcube_edges = [];
var texcube_uvmap = [];

var texcube_points_buffer;
var texcube_normals_buffer;
var texcube_faces_buffer;
var texcube_edges_buffer;
var texcube_uvmap_buffer;

function texcubeInit(gl) {
    texcubeBuild();
    texcubeUploadData(gl);
}

function texcubeBuild()
{
    texcubeAddFace(0,1,2,3,vec3(0,0,1));
    texcubeAddFace(1,5,6,2,vec3(1,0,0));
    texcubeAddFace(4,7,6,5,vec3(0,0,-1));
    texcubeAddFace(0,3,7,4,vec3(-1,0,0));
    texcubeAddFace(3,2,6,7,vec3(0,1,0));
    texcubeAddFace(0,4,5,1,vec3(0,-1,0));    
}

function texcubeUploadData(gl)
{
    texcube_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcube_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texcube_points), gl.STATIC_DRAW);
    
    texcube_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcube_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texcube_normals), gl.STATIC_DRAW);
    
    texcube_uvmap_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcube_uvmap_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texcube_uvmap), gl.STATIC_DRAW);
    
    texcube_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, texcube_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(texcube_faces), gl.STATIC_DRAW);
    
    texcube_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, texcube_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(texcube_edges), gl.STATIC_DRAW);
}

function texcubeDrawWireFrame(gl, program)
{    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, texcube_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, texcube_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, texcube_edges_buffer);
    gl.drawElements(gl.LINES, texcube_edges.length, gl.UNSIGNED_BYTE, 0);
}

function texcubeDrawFilled(gl, program)
{
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, texcube_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, texcube_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, texcube_uvmap_buffer);
    var vTexCoords = gl.getAttribLocation(program, "vTexCoords");
    gl.vertexAttribPointer(vTexCoords, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoords); 
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, texcube_faces_buffer);
    gl.drawElements(gl.TRIANGLES, texcube_faces.length, gl.UNSIGNED_BYTE, 0);
    
    gl.disableVertexAttribArray(vTexCoords); 
}

function texcubeAddFace(a, b, c, d, n)
{
    var offset = texcube_points.length;
    
    texcube_points.push(texcube_vertices[a]);
    texcube_points.push(texcube_vertices[b]);
    texcube_points.push(texcube_vertices[c]);
    texcube_points.push(texcube_vertices[d]);    
    for(var i=0; i<4; i++)
        texcube_normals.push(n);
    
    texcube_uvmap.push(vec2(0.0, 0.0));
    texcube_uvmap.push(vec2(1.0, 0.0));
    texcube_uvmap.push(vec2(1.0, 1.0));
    texcube_uvmap.push(vec2(0.0, 1.0));
    
    // Add 2 triangular faces (a,b,c) and (a,c,d)
    texcube_faces.push(offset);
    texcube_faces.push(offset+1);
    texcube_faces.push(offset+2);
    
    texcube_faces.push(offset);
    texcube_faces.push(offset+2);
    texcube_faces.push(offset+3);
    
    // Add first edge (a,b)
    texcube_edges.push(offset);
    texcube_edges.push(offset+1);
    
    // Add second edge (b,c)
    texcube_edges.push(offset+1);
    texcube_edges.push(offset+2);
}

function texcubeDraw(gl, program, filled=false) {
	if(filled) texcubeDrawFilled(gl, program);
	else texcubeDrawWireFrame(gl, program);
}