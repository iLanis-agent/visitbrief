/* VisitBrief engine - pure symptom-log math, shared by app.html and node tests. */
(function(root, factory){
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VisitBriefEngine = factory();
})(typeof self !== 'undefined' ? self : this, function(){

  function toDate(iso){ var p = iso.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function toISO(d){ return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2); }
  function addDays(iso, n){ var d = toDate(iso); d.setUTCDate(d.getUTCDate() + n); return toISO(d); }
  function daysBetween(aISO, bISO){ return Math.round((toDate(bISO) - toDate(aISO)) / 86400000); }

  /* group entries by symptom name (case-insensitive), entries sorted by date */
  function groupBySymptom(entries){
    var g = {};
    var order = [];
    for (var i = 0; i < entries.length; i++){
      var key = entries[i].symptom.trim().toLowerCase();
      if (!g[key]) { g[key] = { name: entries[i].symptom.trim(), entries: [] }; order.push(key); }
      g[key].entries.push(entries[i]);
    }
    var out = [];
    for (var j = 0; j < order.length; j++){
      var grp = g[order[j]];
      grp.entries.sort(function(a, b){ return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
      out.push(grp);
    }
    return out;
  }

  /* trend: avg severity of entries in the last 3 days vs the 3 days before that (vs todayISO) */
  function trend(entries, todayISO){
    if (!entries.length) return 'no data';
    var recent = [], prior = [];
    for (var i = 0; i < entries.length; i++){
      var age = daysBetween(entries[i].date, todayISO);
      if (age < 0) continue;
      if (age <= 2) recent.push(entries[i].severity);
      else if (age <= 5) prior.push(entries[i].severity);
    }
    if (!recent.length || !prior.length) return 'not enough history';
    var ra = avg(recent), pa = avg(prior);
    if (ra - pa >= 1) return 'getting worse';
    if (pa - ra >= 1) return 'improving';
    return 'stable';
  }

  function avg(nums){ var s = 0; for (var i = 0; i < nums.length; i++) s += nums[i]; return s / nums.length; }

  /* peak = highest severity entry */
  function peak(entries){
    if (!entries.length) return null;
    var best = entries[0];
    for (var i = 1; i < entries.length; i++) if (entries[i].severity > best.severity) best = entries[i];
    return best;
  }

  function daysSinceOnset(entries, todayISO){
    if (!entries.length) return null;
    var first = entries[0].date;
    for (var i = 1; i < entries.length; i++) if (entries[i].date < first) first = entries[i].date;
    return daysBetween(first, todayISO);
  }

  /* rank symptoms for the brief: highest recent-3-day avg severity first */
  function rankGroups(groups, todayISO){
    return groups.slice().sort(function(a, b){
      return recentAvg(b.entries, todayISO) - recentAvg(a.entries, todayISO);
    });
  }
  function recentAvg(entries, todayISO){
    var nums = [];
    for (var i = 0; i < entries.length; i++){
      var age = daysBetween(entries[i].date, todayISO);
      if (age >= 0 && age <= 2) nums.push(entries[i].severity);
    }
    if (!nums.length) for (var j = 0; j < entries.length; j++) nums.push(entries[j].severity);
    return avg(nums);
  }

  /* one-line brief text per symptom group */
  function briefLine(group, todayISO){
    var p = peak(group.entries);
    var days = daysSinceOnset(group.entries, todayISO);
    var parts = [group.name];
    parts.push('day ' + (days + 1) + ' since onset');
    parts.push('trend: ' + trend(group.entries, todayISO));
    if (p) parts.push('worst ' + p.severity + '/10 on ' + fmtShort(p.date));
    return parts.join(' - ');
  }

  function fmtShort(iso){
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var p = iso.split('-');
    return months[+p[1] - 1] + ' ' + (+p[2]);
  }

  function severityWord(n){
    if (n <= 2) return 'mild';
    if (n <= 4) return 'annoying';
    if (n <= 6) return 'disruptive';
    if (n <= 8) return 'severe';
    return 'worst';
  }

  return {
    addDays: addDays,
    daysBetween: daysBetween,
    groupBySymptom: groupBySymptom,
    trend: trend,
    peak: peak,
    daysSinceOnset: daysSinceOnset,
    rankGroups: rankGroups,
    recentAvg: recentAvg,
    briefLine: briefLine,
    fmtShort: fmtShort,
    severityWord: severityWord
  };
});
