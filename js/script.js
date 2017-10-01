window.context  = new AudioContext();
      window.keyboard = new AudioKeys({
        polyphony: 1,
        rows: 1,
        priority: 'last'
      });

      var oneRowLayout = true;
      var image1 = document.querySelector('#image1');
      var image2 = document.querySelector('#image2');

      var polyphony = document.querySelector('#polyphony');
      var priority = document.querySelector('#priority');

      document.querySelector('#row-select').addEventListener('change', function(e) {
        oneRowLayout = !oneRowLayout;
        image1.style.display = oneRowLayout ? 'block' : 'none';
        image2.style.display = oneRowLayout ? 'none' : 'block';
        keyboard.set('rows', oneRowLayout ? 1 : 2);
      });

      polyphony.addEventListener('change', function(e) {
        keyboard.set('polyphony', +e.target.value);
      });

      priority.addEventListener('change', function(e) {
        keyboard.set('priority', e.target.value);
      });

      var oscillators = {};

      keyboard.down( function(note) {
        var o = context.createOscillator();
        var g = context.createGain();
        o.frequency.value = note.frequency;
        o.type = 'triangle';
        g.gain.value = 0;
        o.connect(g);
        g.connect(context.destination);

        g.gain.linearRampToValueAtTime(0, context.currentTime);
        g.gain.linearRampToValueAtTime(note.velocity / 127, context.currentTime + 0.1);

        o.start(0);
        oscillators[note.note] = {
          oscillator: o,
          gain: g
        };
      });

      keyboard.up( function(note) {
        if(oscillators[note.note]) {
          oscillators[note.note].gain.gain.linearRampToValueAtTime(oscillators[note.note].gain.gain.value, context.currentTime);
          oscillators[note.note].gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.1);
          oscillators[note.note].oscillator.stop(context.currentTime + 0.1);
          delete oscillators[note.note];
        }
      });