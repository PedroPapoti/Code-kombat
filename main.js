import {loadGLTF} from "./libs/loader.js";
const THREE = window.MINDAR.FACE.THREE;

const capture = (mindarThree) => {
  const {video, renderer, scene, camera} = mindarThree;
  const renderCanvas = renderer.domElement;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = renderCanvas.width;
  canvas.height = renderCanvas.height;

  const sx = (video.clientWidth - renderCanvas.clientWidth) / 2 * video.videoWidth / video.clientWidth;
  const sy = (video.clientHeight - renderCanvas.clientHeight) / 2 * video.videoHeight / video.clientHeight;
  const sw = video.videoWidth - sx * 2; 
  const sh = video.videoHeight - sy * 2; 

  context.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  
  renderer.preserveDrawingBuffer = true;
  renderer.render(scene, camera); 
  context.drawImage(renderCanvas, 0, 0, canvas.width, canvas.height);
  renderer.preserveDrawingBuffer = false;

  const data = canvas.toDataURL('image/png');
  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    
    const mindarThree = new window.MINDAR.FACE.MindARThree({
      container: document.body,
    });
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.6);
    light2.position.set(-0.5, 1, 1);
    scene.add(light);
    scene.add(light2);

    
    const captains = await loadGLTF('./models/captains/scene.gltf');
    captains.scene.position.set(0, 0.2, -0.5);
    captains.scene.scale.set(0.40, 0.40, 0.40);
    captains.scene.renderOrder = 1;
    const captainsAnchor = mindarThree.addAnchor(10);
    captainsAnchor.group.add(captains.scene);
    

    const american = await loadGLTF('./models/american/scene.gltf');
    american.scene.position.set(0, -0.2, -0.5);
    american.scene.scale.set(0.060, 0.060, 0.060);
    american.scene.renderOrder = 1;
    const americanAnchor = mindarThree.addAnchor(10);
    americanAnchor.group.add(american.scene);

    const skull = await loadGLTF('./models/skull/scene.gltf');
    skull.scene.position.set(0, -0.9, 0);
    skull.scene.scale.set(0.3, 0.3, 0.3);
    skull.scene.renderOrder = 1;
    const skullAnchor = mindarThree.addAnchor(168); 
    skullAnchor.group.add(skull.scene);

    const mask = await loadGLTF('./models/mask/scene.gltf');
    mask.scene.position.set(0, -0.2, 0);
    mask.scene.scale.set(0.6, 0.6, 0.6);
    mask.scene.renderOrder = 1;
    const maskAnchor = mindarThree.addAnchor(168); 
    maskAnchor.group.add(mask.scene);

    const earringLeft = await loadGLTF('./models/diamond/scene.gltf');
    earringLeft.scene.position.set(0, -0.2, -0.2);
    earringLeft.scene.scale.set(0.8, 0.8, 0.8);
    earringLeft.scene.renderOrder = 1;
    const earringLeftAnchor = mindarThree.addAnchor(127);
    earringLeftAnchor.group.add(earringLeft.scene);

    const earringRight = await loadGLTF('./models/diamond/scene.gltf');
    earringRight.scene.position.set(0.02, -0.2, -0.1);
    earringRight.scene.scale.set(0.8, 0.8, 0.8);
    earringRight.scene.renderOrder = 1;
    const earringRightAnchor = mindarThree.addAnchor(356);
    earringRightAnchor.group.add(earringRight.scene);

    const buttons = ["#captains", "#american", "#skull", "#mask", "#earring"];
    const models = [[captains.scene], [american.scene], [skull.scene], [mask.scene], [earringLeft.scene, earringRight.scene]];
    const visibles = [true, false, false, false, true];

    const setVisible = (button, models, visible) => {
      if (visible) {
	button.classList.add("selected");
      } else {
	button.classList.remove("selected");
      }
      models.forEach((model) => {
	model.visible = visible;
      });
    }
    buttons.forEach((buttonId, index) => {
      const button = document.querySelector(buttonId);
      setVisible(button, models[index], visibles[index]);
      button.addEventListener('click', () => {
	visibles[index] = !visibles[index];
	setVisible(button, models[index], visibles[index]);
      });
    });

    const previewImage = document.querySelector("#preview-image");
    const previewClose = document.querySelector("#preview-close");
    const preview = document.querySelector("#preview");
    const previewShare = document.querySelector("#preview-share");

    document.querySelector("#capture").addEventListener("click", () => {
      const data = capture(mindarThree);
      preview.style.visibility = "visible";
      previewImage.src = data;
    });

    previewClose.addEventListener("click", () => {
      preview.style.visibility = "hidden";
    });

    previewShare.addEventListener("click", () => {
      const canvas = document.createElement('canvas');
      canvas.width = previewImage.width;
      canvas.height = previewImage.height;
      const context = canvas.getContext('2d');
      context.drawImage(previewImage, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
	const file = new File([blob], "photo.png", {type: "image/png"});
	const files = [file];
	if (navigator.canShare && navigator.canShare({files})) {
	  navigator.share({
	    files: files,
	    title: 'AR Photo',
	  })
	} else {
	  const link = document.createElement('a');
	  link.download = 'photo.png';
	  link.href = previewImage.src;
	  link.click();
	}
      });
    });

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});

