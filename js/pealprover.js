function get_composition() {
	var methods = {};

	var comptext = $('#composition').val();
	var comp = Composition();
	var done_call = true;
	var last_method;

	// TODO: warn about failures
	$('#methodList').each(function() {
		for(i=0; i < $(this).children().length; i++) {
			var vm = validate_method($(this).children()[i].id.substr(6));
			methods[vm[0]] = vm[1];
		}
	});

	var txtCalls = new Object();
	for (n = 0; n < $('#calls table tr').size()-1; n++) {
		var symbol = $("#symbol"+n).val();
		var not = $("#callNtn"+n).val();
		txtCalls[symbol] = parse_bell_list(comp.rank, 0, not);
	}

	var first = true;
	var is_ce = false;
	var last_call = -1;

	for (i = 0; i < comptext.length; i++) {
		c = comptext.charAt(i);
		
		if (c in methods) {
			if (!done_call) {
				comp.append_lead(last_method, -1);
			}
			last_method = methods[c];
			done_call = false;
		} else if (c in txtCalls) {
			comp.append_lead(last_method, txtCalls[c].mask);
			done_call = true;
		} else if (c === '\n') {
			is_ce = true;
		}
	}
	if (!done_call) {
		comp.append_lead(last_method, -1);
	}

	return [comp, txtCalls];
}

function validate_method(id) {
	var shortcut;
	var rows;
	var rank;
	var method;
	var notation;
   
	shortcut = $('#shortcut' + id).val();
	if (shortcut == "") {
		return false;
	}
	notation = $('#notation' + id).val();
	if (notation == "") {
		return false;
	}
	rank = parseInt($('#methodRank').val(), 10);
	if (rank <= 0 || rank > MAX_RANK) {
		return false;
	}
	rows = parse_method(rank, notation);
	method = Method(rank, shortcut, rows);
	//methods[shortcut] = method;
	return [shortcut, method];
	//return true;
}

function do_prove() {
	var p = Prover();
	var changes = 0;
	var rounds = 0;
	var music = MusicBox();
	var musicOutput;

	function test_row(c, le) {
		var r;

		changes++;
		if (rounds !== 0) {
			return;
		}
		music.match_row(c);
		r = p.check_row(c);

		if (r < 0) {
			rounds = -changes;
		} else if (r == 1) {
			rounds = changes;
		}
	}

	var gc = get_composition();
	var comp = gc[0];
	var txtCalls = gc[1];
	
	// add 4-bell run patterns whatever the stage (rank)
	for(i=0; i < comp.rank; i++) {
		// fill up the rest of the music array with the correct number of -1's
		var spareBells = new Array();
		var runs = new Array();
		for(j=0; j < (comp.rank-4); j++) {
			spareBells[j] = -1;
		}
        
		// music for all numbers of bells
        
		// forward run off the front (ie 1234.... etc)
		runs = runs.concat([i, i+1, i+2, i+3], spareBells);
		music.add_pattern(runs);
		runs = new Array();
    	
		// backward run off the front (ie 4321....)
		runs = runs.concat([i+3, i+2, i+1, i], spareBells);
		music.add_pattern(runs);
		runs = new Array();
    	
		// forward run at the back (ie ....1234)
		runs = runs.concat(spareBells, [i, i+1, i+2, i+3]);
		music.add_pattern(runs);
		runs = new Array();
    	
		// backward run at the back (ie ....4321)
		runs = runs.concat(spareBells, [i+3, i+2, i+1, i]);
		music.add_pattern(runs);
        
		spareBells, runs = null; // clean up - not sure this is necessary
	}
	/* other good 8-bell specific music */
	if(comp.rank === 8) {
		music.add_pattern([-1,-1,-1,-1,6, 4, 5, 7]); // ****7568
		music.add_pattern([-1,-1,-1,-1,5, 4, 6, 7]); // ****6578
		music.add_pattern([-1,-1,-1,-1,1, 3, 5, 7]); // ****2468
		music.add_pattern([0,2,4,6,1, 3, 5, 7]); // 13572468
		music.add_pattern([6,4,2,0,1, 3, 5, 7]); // 75312468
		music.add_pattern([0,4,1,5,2,6,3,7]); // 15263748
		music.add_pattern([0,1,6,4,2,3,5,7]); // 12753468
	}
	
	// add user specific music patterns
	var userInputPatterns = $('#userMusicList').val();
	if(userInputPatterns.length != 0) {
		var userPatterns = readUserMusicPatterns(userInputPatterns);
		for(i = 0; i < userPatterns.length; i++) {
			// ignore empty values (ie line feeds)
			if(userPatterns[i].length != 0) {
				music.add_pattern(userPatterns[i]);
			}
		}
	}
	
	music.setup(comp.rank);
	comp.run(test_row);
	
	// display course ends
	var comptext = $('#composition').val();

	// now remove the calls from the comp text (look up from call list)
	// split the composition up at the carriage returns.
	for(i in txtCalls) {
		var regex = new RegExp(i, 'g');
		comptext = comptext.replace(regex, '');
	}

	comptext = comptext.split("\n");

	var leads = [];
	for(i=0; i<comp.leadends.length; i++) {
		var lead = "";
		for(j=0; j<comp.leadends[i].length; j++) {
			lead += bell_name(comp.leadends[i][j]);
		}
		leads[i] = lead;
	}

	var courses = "";
	var leadNo = 0;
	for(c = 0; c < comptext.length; c++) {
		if(comptext.length > 0) {
			leadNo = comptext[c].length + leadNo;
			courses += leads[leadNo-1] + "\n";
		}
	}

	if (rounds > 0) {
		if (rounds != changes) {
			res = "<span class=\"true\">Touch is true: " + rounds + " changes (" + (changes - rounds) + " before last course end)</span>";
		} else {
			res = "<span class=\"true\">Touch is true: " + rounds + " changes</span>";
		}
	} else if (rounds < 0) {
		res = "<span class=\"false\">Touch is false: false after " + (-rounds) + " changes</span>";
	} else {
		res = "<span class=\"incomplete\">Incomplete touch (" + changes + " changes)</span>";
	}

	musicOutput = "<pre>";
	for (i = 0; i < music.counts.length; i++) {
		var pattern = "";
		// add run count to music output array only if those runs exist
		if(music.counts[i] != 0 ) {
			for(j=0; j < music.patterns[i].length; j++) {
				pattern += bell_name(music.patterns[i][j]);
			}
			musicOutput += "<strong>" + music.counts[i] + "</strong>\t" + pattern + "\n";
		}
	}
	musicOutput += "</pre>";
    
	return [res, musicOutput, courses];
}

function generateShorthand(methodID, bob, single) {
	var vm = validate_method(methodID);
	var s = Shorthand($('#shorthand').val(), vm[1]);

	try {
		s.run(nothing, bob, single);
	} catch (er) {
		displayWarning(er);
	}
	$('#composition').val(s.compText);

	function nothing() {}
}