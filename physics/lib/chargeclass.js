var canvas, ctx;
class Charge {
  //charge class
  constructor(
    type,
    position,
    velocity = {
      x: 0,
      y: 0
    }
  ) {
    this.position = position;
    this.velocity = velocity;
    if (type === "e") {
      this.electron = true;
      this.name = "electron";
      this.charge = -1;
      this.radius = 15;
      this.color = "rgba(0,100,255,0.4)";
    } else if (type === "p") {
      this.electron = false;
      this.name = "proton";
      this.charge = 1;
      this.radius = 4;
      this.color = "rgba(255,0,100,1)";
    }
  }

  static spawnCharges(who, len = 1, type = "e") {
    for (let i = 0; i < len; ++i) {
      who[who.length] = new Charge(type, {
        x: 30 + Math.random() * (canvas.width - 60),
        y: 30 + Math.random() * (canvas.height - 60)
      });
    }
  }

  static setCanvas(el) {
    canvas = el;
    ctx = canvas.getContext("2d");
    ctx.font = "300 20px Roboto";
  }

  static drawAll(who) {
    for (let i = 0, len = who.length; i < len; ++i) {
      ctx.fillStyle = who[i].color;
      ctx.beginPath();
      ctx.arc(who[i].position.x, who[i].position.y, who[i].radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  static teleport(who, off = 200) {
    let count = 0;
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].electron && who[i].position.x > canvas.width + off) {
        count++;
        who[i].position.x = -off;
      }
    }
    return count;
  }

  static bounds(who, range = 50) {
    //range = how far outside of canvas,  0 is at canvas edge
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].electron) {
        if (who[i].position.x > canvas.width + range) {
          who[i].velocity.x = 0; //-Math.abs(who[i].velocity.x)
          who[i].position.x = canvas.width + range;
        } else if (who[i].position.x < -range) {
          who[i].velocity.x = 0; //Math.abs(who[i].velocity.x)
          who[i].position.x = -range;
        }
        if (who[i].position.y > canvas.height + range) {
          who[i].velocity.y = 0; //-Math.abs(who[i].velocity.y)
          who[i].position.y = canvas.height + range;
        } else if (who[i].position.y < -range) {
          who[i].velocity.y = 0; //Math.abs(who[i].velocity.y)
          who[i].position.y = -range;
        }
      }
    }
  }

  static physicsAll(who, friction = 0.99, minDistance2 = 600) {
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].electron) {
        //change position from velocity
        who[i].position.x += who[i].velocity.x;
        who[i].position.y += who[i].velocity.y;
        //friction
        who[i].velocity.x *= friction;
        who[i].velocity.y *= friction;
        //accelerate from electrostatic force
        for (let j = 0, len = who.length; j < len; ++j) {
          if (i != j) {
            const dx = who[i].position.x - who[j].position.x;
            const dy = who[i].position.y - who[j].position.y;
            const d2 = Math.max(dx * dx + dy * dy, minDistance2);
            const mag = (200 * who[i].charge * who[j].charge) / (d2 * Math.sqrt(d2));
            who[i].velocity.x += mag * dx;
            who[i].velocity.y += mag * dy;
          }
        }
      }
    }
  }

  static magneticField(who, B) {
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].electron) {
        const velocity = Math.sqrt(who[i].velocity.x * who[i].velocity.x + who[i].velocity.y * who[i].velocity.y);
        const mag = B; //who[i].charge
        // assumes the magnetic field, B, is either in or out of the page
        who[i].velocity.x -= mag * who[i].velocity.y;
        who[i].velocity.y += mag * who[i].velocity.x;
      }
    }
  }

  static drawMagneticField(B) {
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.3;
    var steps = 30 / Math.pow(Math.abs(B), 0.2);
    var text;
    if (B < 0) {
      for (var i = 0; i < canvas.width; i += steps) {
        for (var j = 0; j < canvas.height; j += steps) {
          ctx.beginPath();
          ctx.arc(i, j, 10, 0, 2 * Math.PI);
          ctx.moveTo(i + 7, j + 7);
          ctx.lineTo(i - 7, j - 7);
          ctx.moveTo(i - 7, j + 7);
          ctx.lineTo(i + 7, j - 7);
          ctx.stroke();
        }
      }
    } else if (B > 0) {
      for (var i = 0; i < canvas.width; i += steps) {
        for (var j = 0; j < canvas.height; j += steps) {
          ctx.beginPath();
          ctx.arc(i, j, 10, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(i, j, 1.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  // static physicsAll(who) {
  //   const minDistance2 = 1000;
  //   for (let i = 0, len = who.length; i < len; ++i) {
  //     if (who[i].electron) {
  //       //change position from velocity
  //       who[i].position.x += who[i].velocity.x;
  //       who[i].position.y += who[i].velocity.y;
  //       //friction
  //       who[i].velocity.x *= 0.99;
  //       who[i].velocity.y *= 0.99;
  //       //accelerate from electrostatic force
  //       for (let j = 0, len = who.length; j < len; ++j) {
  //         if (i != j) {
  //           const dx = who[i].position.x - who[j].position.x;
  //           const dy = who[i].position.y - who[j].position.y;
  //           const d2 = Math.max(dx * dx + dy * dy, minDistance2);
  //           const mag = 200 * who[i].charge * who[j].charge / (d2 * Math.sqrt(d2));
  //           who[i].velocity.x += mag * dx;
  //           who[i].velocity.y += mag * dy;
  //         }
  //       }
  //     }
  //   }
  // }

  // static physicsAll(who) {
  //   for (let i = 0, len = who.length; i < len; ++i) {
  //     if (who[i].electron) {
  //       //move
  //       who[i].position.x += who[i].velocity.x;
  //       who[i].position.y += who[i].velocity.y;
  //       //friction
  //       who[i].velocity.x *= 0.99;
  //       who[i].velocity.y *= 0.99;
  //       //electrostatic force
  //       for (let j = 0, len = who.length; j < len; ++j) {
  //         if (j < i) {
  //           const dx = who[i].position.x - who[j].position.x;
  //           const dy = who[i].position.y - who[j].position.y;
  //           const a = Math.atan2(dy, dx);
  //           const r = dx * dx + dy * dy + 1000; //the +1000 keeps r from being zero / adds stability
  //           const mag = 200 * who[i].charge * who[j].charge / r;
  //           who[i].velocity.x += mag * Math.cos(a);
  //           who[i].velocity.y += mag * Math.sin(a);
  //           who[j].velocity.x -= mag * Math.cos(a);
  //           who[j].velocity.y -= mag * Math.sin(a);
  //         }
  //       }
  //     }
  //   }
  // }

  static pushZone(who, offx = 0, offy = 50, height = 300, push = 0.1) {
    const range = {
      min: {
        x: offx - 50,
        y: offy
      },
      max: {
        x: offx + 50,
        y: offy + height
      }
    };
    //draw push
    ctx.beginPath();
    ctx.moveTo(range.min.x, range.min.y);
    ctx.lineTo(range.min.x, range.max.y);
    ctx.lineTo(range.max.x, range.max.y);
    ctx.lineTo(range.max.x, range.min.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fill();
    ctx.stroke();
    // ctx.strokeStyle = "#000";
    // ctx.stroke();
    //push electrons
    for (let i = 0, len = who.length; i < len; ++i) {
      if (
        who[i].electron &&
        who[i].position.x < range.max.x &&
        who[i].position.x > range.min.x &&
        who[i].position.y < range.max.y &&
        who[i].position.y > range.min.y
      ) {
        who[i].velocity.y += push;
      }
    }
  }
  static slow(range, who) {
    //draw slow
    ctx.beginPath();
    ctx.moveTo(range.min.x, range.min.y);
    ctx.lineTo(range.min.x, range.max.y);
    ctx.lineTo(range.max.x, range.max.y);
    ctx.lineTo(range.max.x, range.min.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fill();
    //slow electrons
    for (let i = 0, len = who.length; i < len; ++i) {
      if (
        who[i].electron &&
        who[i].position.x < range.max.x &&
        who[i].position.x > range.min.x &&
        who[i].position.y < range.max.y &&
        who[i].position.y > range.min.y
      ) {
        who[i].velocity.x *= 0.8;
        who[i].velocity.y *= 0.8;
      }
    }
  }

  static repulse(who, pos) {
    for (let i = 0, len = who.length; i < len; ++i) {
      if (who[i].electron) {
        const dx = who[i].position.x - pos.x;
        const dy = who[i].position.y - pos.y;
        const a = Math.atan2(dy, dx);
        //the +4000 keeps r from being zero
        const r = dx * dx + dy * dy + 4000;
        const mag = 30000 / r;
        who[i].velocity.x += mag * Math.cos(a);
        who[i].velocity.y += mag * Math.sin(a);
      }
    }
  }

  static potential(who, position) {
    let v = 0;
    for (let i = 0, len = who.length; i < len; ++i) {
      const dx = who[i].position.x - position.x;
      const dy = who[i].position.y - position.y;
      // const a = Math.atan2(dy, dx);
      // //the +4000 keeps r from being zero / adds stability
      // const r = (dx * dx + dy * dy) + 4000
      // v += 200 * who[i].charge / r;

      v += who[i].charge / Math.sqrt(dx * dx + dy * dy + 4000);
    }
    return v;
  }

  static vectorField(who, spacing = 15) {
    var lenX = Math.floor(canvas.width / spacing);
    var lenY = Math.floor(canvas.height / spacing);
    var x, y, dist, draw;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#033";
    for (var k = 0; k < lenY; k++) {
      for (var j = 0; j < lenX; j++) {
        draw = true;
        x = (canvas.width * (j + 0.5)) / lenX;
        y = (canvas.height * (k + 0.5)) / lenY;
        //calc Forces
        var f, a;
        var fx = 0;
        var fy = 0;
        for (var i = 0; i < who.length; i++) {
          var dx = who[i].position.x - x;
          var dy = who[i].position.y - y;
          dist = Math.sqrt(dx * dx + dy * dy) + 1000;
          if (dist < who[i].r) {
            draw = false; //don't draw in inside a body
            break; //exit the forloop
          }
          f = (-who[i].charge * 6000000) / (dist * dist);
          a = Math.atan2(dy, dx);
          fx += f * Math.cos(a);
          fy += f * Math.sin(a);
        }
        if (draw) {
          f = Math.sqrt(fx * fx + fy * fy);
          if (f > spacing - 5) f = spacing - 5;
          a = Math.atan2(fy, fx);
          var alpha = 1;
          if (f < 6) alpha = f / 6;
          ctx.globalAlpha = alpha * alpha;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(a);
          //vector line
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.abs(f), 0);
          ctx.stroke();
          //arrows
          ctx.beginPath();
          ctx.moveTo(f + 4, 0);
          ctx.lineTo(f, -2);
          ctx.lineTo(f, 2);
          ctx.fillStyle = "#033";
          ctx.fill();
          ctx.restore();
        }
      }
    }
    ctx.globalAlpha = 1;
  }
  static scalarField(who) {
    const fieldMag = 1000;
    const chromaBytes = [
      [0x88, 0x00, 0x00],
      [0x8b, 0x00, 0x00],
      [0x8f, 0x00, 0x01],
      [0x93, 0x00, 0x01],
      [0x96, 0x00, 0x01],
      [0x9a, 0x00, 0x02],
      [0x9d, 0x00, 0x02],
      [0xa1, 0x00, 0x02],
      [0xa4, 0x00, 0x02],
      [0xa8, 0x00, 0x02],
      [0xac, 0x00, 0x02],
      [0xaf, 0x00, 0x02],
      [0xb3, 0x00, 0x02],
      [0xb7, 0x00, 0x02],
      [0xbb, 0x00, 0x02],
      [0xbe, 0x00, 0x02],
      [0xc2, 0x00, 0x02],
      [0xc6, 0x00, 0x02],
      [0xc9, 0x00, 0x02],
      [0xcd, 0x00, 0x02],
      [0xd1, 0x00, 0x02],
      [0xd5, 0x00, 0x02],
      [0xd9, 0x00, 0x02],
      [0xdc, 0x00, 0x01],
      [0xe0, 0x00, 0x01],
      [0xe4, 0x00, 0x01],
      [0xe8, 0x00, 0x01],
      [0xec, 0x00, 0x01],
      [0xf0, 0x00, 0x01],
      [0xf4, 0x00, 0x01],
      [0xf8, 0x00, 0x00],
      [0xfc, 0x00, 0x00],
      [0xff, 0x02, 0x00],
      [0xff, 0x13, 0x00],
      [0xff, 0x1e, 0x00],
      [0xff, 0x25, 0x00],
      [0xff, 0x2c, 0x00],
      [0xff, 0x32, 0x00],
      [0xff, 0x37, 0x00],
      [0xff, 0x3c, 0x00],
      [0xff, 0x40, 0x00],
      [0xff, 0x44, 0x00],
      [0xff, 0x48, 0x00],
      [0xff, 0x4c, 0x00],
      [0xff, 0x50, 0x00],
      [0xff, 0x53, 0x00],
      [0xff, 0x56, 0x00],
      [0xff, 0x5a, 0x00],
      [0xff, 0x5d, 0x00],
      [0xff, 0x60, 0x00],
      [0xff, 0x63, 0x00],
      [0xff, 0x66, 0x00],
      [0xff, 0x69, 0x00],
      [0xff, 0x6c, 0x00],
      [0xff, 0x6f, 0x00],
      [0xff, 0x71, 0x00],
      [0xff, 0x74, 0x00],
      [0xff, 0x77, 0x00],
      [0xff, 0x79, 0x00],
      [0xff, 0x7c, 0x00],
      [0xff, 0x7f, 0x00],
      [0xff, 0x81, 0x00],
      [0xff, 0x84, 0x00],
      [0xff, 0x86, 0x00],
      [0xff, 0x89, 0x00],
      [0xff, 0x8c, 0x00],
      [0xff, 0x8e, 0x00],
      [0xff, 0x91, 0x00],
      [0xff, 0x94, 0x00],
      [0xff, 0x97, 0x00],
      [0xff, 0x9a, 0x00],
      [0xff, 0x9c, 0x00],
      [0xff, 0x9f, 0x00],
      [0xff, 0xa2, 0x00],
      [0xff, 0xa5, 0x00],
      [0xff, 0xa7, 0x00],
      [0xff, 0xaa, 0x00],
      [0xff, 0xad, 0x00],
      [0xff, 0xaf, 0x00],
      [0xff, 0xb2, 0x00],
      [0xff, 0xb5, 0x00],
      [0xff, 0xb7, 0x00],
      [0xff, 0xba, 0x00],
      [0xff, 0xbc, 0x00],
      [0xff, 0xbf, 0x00],
      [0xff, 0xc2, 0x00],
      [0xff, 0xc4, 0x00],
      [0xff, 0xc7, 0x00],
      [0xff, 0xc9, 0x00],
      [0xff, 0xcc, 0x00],
      [0xff, 0xcf, 0x00],
      [0xff, 0xd1, 0x00],
      [0xff, 0xd4, 0x00],
      [0xff, 0xd6, 0x00],
      [0xff, 0xd9, 0x00],
      [0xff, 0xdb, 0x00],
      [0xff, 0xdd, 0x0e],
      [0xff, 0xde, 0x22],
      [0xff, 0xdf, 0x30],
      [0xff, 0xe0, 0x3b],
      [0xff, 0xe1, 0x44],
      [0xff, 0xe2, 0x4d],
      [0xff, 0xe3, 0x55],
      [0xff, 0xe4, 0x5d],
      [0xff, 0xe5, 0x65],
      [0xff, 0xe6, 0x6c],
      [0xff, 0xe7, 0x73],
      [0xff, 0xe8, 0x7a],
      [0xff, 0xe9, 0x81],
      [0xff, 0xeb, 0x88],
      [0xff, 0xec, 0x8e],
      [0xff, 0xed, 0x95],
      [0xff, 0xee, 0x9b],
      [0xff, 0xef, 0xa2],
      [0xff, 0xf0, 0xa9],
      [0xff, 0xf1, 0xaf],
      [0xff, 0xf2, 0xb5],
      [0xff, 0xf3, 0xbc],
      [0xff, 0xf4, 0xc2],
      [0xff, 0xf5, 0xc9],
      [0xff, 0xf6, 0xcf],
      [0xff, 0xf8, 0xd5],
      [0xff, 0xf9, 0xdc],
      [0xff, 0xfa, 0xe2],
      [0xff, 0xfb, 0xe9],
      [0xff, 0xfc, 0xef],
      [0xff, 0xfd, 0xf5],
      [0xff, 0xfe, 0xfc],
      [0xfd, 0xfe, 0xff],
      [0xf8, 0xfd, 0xff],
      [0xf3, 0xfc, 0xff],
      [0xee, 0xfb, 0xff],
      [0xea, 0xfa, 0xff],
      [0xe5, 0xf9, 0xff],
      [0xe0, 0xf8, 0xff],
      [0xdb, 0xf7, 0xff],
      [0xd6, 0xf6, 0xff],
      [0xd1, 0xf5, 0xff],
      [0xcc, 0xf4, 0xff],
      [0xc6, 0xf3, 0xff],
      [0xc1, 0xf2, 0xff],
      [0xbc, 0xf1, 0xff],
      [0xb6, 0xf0, 0xff],
      [0xb0, 0xef, 0xff],
      [0xab, 0xee, 0xff],
      [0xa5, 0xed, 0xff],
      [0x9f, 0xec, 0xff],
      [0x98, 0xeb, 0xff],
      [0x92, 0xea, 0xff],
      [0x8b, 0xe9, 0xff],
      [0x84, 0xe7, 0xff],
      [0x7d, 0xe6, 0xff],
      [0x75, 0xe5, 0xff],
      [0x6d, 0xe4, 0xff],
      [0x64, 0xe3, 0xff],
      [0x5a, 0xe2, 0xff],
      [0x4f, 0xe1, 0xff],
      [0x42, 0xe0, 0xff],
      [0x31, 0xdf, 0xff],
      [0x17, 0xdd, 0xff],
      [0x04, 0xdb, 0xff],
      [0x0a, 0xd9, 0xff],
      [0x0f, 0xd6, 0xff],
      [0x13, 0xd3, 0xff],
      [0x16, 0xd0, 0xff],
      [0x18, 0xce, 0xff],
      [0x1a, 0xcb, 0xff],
      [0x1b, 0xc8, 0xff],
      [0x1d, 0xc6, 0xff],
      [0x1e, 0xc3, 0xff],
      [0x1f, 0xc0, 0xff],
      [0x1f, 0xbe, 0xff],
      [0x20, 0xbb, 0xff],
      [0x20, 0xb8, 0xff],
      [0x21, 0xb6, 0xff],
      [0x21, 0xb3, 0xff],
      [0x20, 0xb0, 0xff],
      [0x20, 0xae, 0xff],
      [0x20, 0xab, 0xff],
      [0x1f, 0xa8, 0xff],
      [0x1e, 0xa6, 0xff],
      [0x1d, 0xa3, 0xff],
      [0x1c, 0xa0, 0xff],
      [0x1b, 0x9e, 0xff],
      [0x19, 0x9b, 0xff],
      [0x18, 0x98, 0xff],
      [0x15, 0x96, 0xff],
      [0x13, 0x93, 0xff],
      [0x10, 0x91, 0xff],
      [0x0c, 0x8e, 0xff],
      [0x07, 0x8b, 0xff],
      [0x01, 0x89, 0xff],
      [0x06, 0x86, 0xff],
      [0x0d, 0x83, 0xff],
      [0x12, 0x80, 0xff],
      [0x16, 0x7d, 0xff],
      [0x19, 0x7a, 0xff],
      [0x1b, 0x77, 0xff],
      [0x1d, 0x73, 0xff],
      [0x1f, 0x70, 0xff],
      [0x20, 0x6d, 0xff],
      [0x21, 0x6a, 0xff],
      [0x22, 0x67, 0xff],
      [0x23, 0x64, 0xff],
      [0x24, 0x61, 0xff],
      [0x24, 0x5d, 0xff],
      [0x24, 0x5a, 0xff],
      [0x24, 0x57, 0xff],
      [0x24, 0x53, 0xff],
      [0x24, 0x50, 0xff],
      [0x23, 0x4c, 0xff],
      [0x22, 0x48, 0xff],
      [0x22, 0x45, 0xff],
      [0x21, 0x41, 0xff],
      [0x1f, 0x3d, 0xff],
      [0x1e, 0x39, 0xff],
      [0x1c, 0x34, 0xff],
      [0x1a, 0x30, 0xff],
      [0x18, 0x2b, 0xff],
      [0x15, 0x26, 0xff],
      [0x11, 0x1f, 0xff],
      [0x0d, 0x18, 0xff],
      [0x07, 0x0f, 0xff],
      [0x01, 0x02, 0xff],
      [0x00, 0x00, 0xfc],
      [0x00, 0x00, 0xf8],
      [0x00, 0x00, 0xf4],
      [0x00, 0x00, 0xf0],
      [0x00, 0x00, 0xec],
      [0x00, 0x00, 0xe8],
      [0x00, 0x00, 0xe4],
      [0x00, 0x00, 0xe0],
      [0x00, 0x00, 0xdd],
      [0x00, 0x00, 0xd9],
      [0x00, 0x00, 0xd5],
      [0x00, 0x00, 0xd1],
      [0x00, 0x00, 0xcd],
      [0x00, 0x00, 0xca],
      [0x00, 0x00, 0xc6],
      [0x00, 0x00, 0xc2],
      [0x00, 0x00, 0xbe],
      [0x00, 0x00, 0xbb],
      [0x00, 0x00, 0xb7],
      [0x00, 0x00, 0xb3],
      [0x00, 0x00, 0xaf],
      [0x00, 0x00, 0xac],
      [0x00, 0x00, 0xa8],
      [0x00, 0x00, 0xa5],
      [0x00, 0x00, 0xa1],
      [0x00, 0x00, 0x9d],
      [0x00, 0x00, 0x9a],
      [0x00, 0x00, 0x96],
      [0x00, 0x00, 0x93],
      [0x00, 0x00, 0x8f],
      [0x00, 0x00, 0x8c],
      [0x00, 0x00, 0x88]
    ];

    let imgData = ctx.createImageData(canvas.width, canvas.height);

    for (var i = 0; i < imgData.data.length; i += 8) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor(i / 4 / canvas.width);
      let mag = 0;
      for (let j = 0, len = who.length; j < len; j++) {
        const dx = who[j].position.x - x;
        const dy = who[j].position.y - y;
        mag -= who[j].charge / (Math.sqrt(dx * dx + dy * dy) + 1);
      }
      let hue = Math.min(Math.max(Math.round(mag * fieldMag) + 128, 0), 255);

      // imgData.data[i + 0] = chromaBytes[hue][0]; // red
      // imgData.data[i + 1] = chromaBytes[hue][1]; // green
      // imgData.data[i + 2] = chromaBytes[hue][2]; // blue
      // imgData.data[i + 3] = 255; // alpha

      for (let k = 0; k < 8; k += 4) {
        //make pixels bigger, is this really worth it?
        imgData.data[i + k + 0] = chromaBytes[hue][0]; // red
        imgData.data[i + k + 1] = chromaBytes[hue][1]; // green
        imgData.data[i + k + 2] = chromaBytes[hue][2]; // blue
        imgData.data[i + k + 3] = 255; // alpha
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  static magnetic(who, scale = 0.05) {
    for (let i = 0, len = who.length; i < len; ++i) {
      let dir = Math.atan2(who[i].velocity.y, who[i].velocity.x);
      let angle = dir + (Math.PI / 2) * who[i].charge;
      let speed = Math.sqrt(who[i].velocity.x * who[i].velocity.x + who[i].velocity.y * who[i].velocity.y);
      let mag = scale * speed;
      who[i].velocity.x += mag * Math.cos(angle);
      who[i].velocity.y += mag * Math.sin(angle);
    }
  }
}
