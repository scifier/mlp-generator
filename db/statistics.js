const statistics = [
  { min: 0, max: 4.54 }, // [0] word_freq_make
  { min: 0, max: 14.28 }, // [1] word_freq_address
  { min: 0, max: 5.1 }, // [2] word_freq_all
  { min: 0, max: 42.81 }, // [3] word_freq_3d
  { min: 0, max: 10 }, // [4] word_freq_our
  { min: 0, max: 5.88 }, // [5] word_freq_over
  { min: 0, max: 7.27 }, // [6] word_freq_remove
  { min: 0, max: 11.11 }, // [7] word_freq_internet
  { min: 0, max: 5.26 }, // [8] word_freq_order
  { min: 0, max: 18.18 }, // [9] word_freq_mail
  { min: 0, max: 2.61 }, // [10] word_freq_receive
  { min: 0, max: 9.67 }, // [11] word_freq_will
  { min: 0, max: 5.55 }, // [12] word_freq_people
  { min: 0, max: 10 }, // [13] word_freq_report
  { min: 0, max: 4.41 }, // [14] word_freq_addresses
  { min: 0, max: 20 }, // [15] word_freq_free
  { min: 0, max: 7.14 }, // [16] word_freq_business
  { min: 0, max: 9.09 }, // [17] word_freq_email
  { min: 0, max: 18.75 }, // [18] word_freq_you
  { min: 0, max: 18.18 }, // [19] word_freq_credit
  { min: 0, max: 11.11 }, // [20] word_freq_your
  { min: 0, max: 17.1 }, // [21] word_freq_font
  { min: 0, max: 5.45 }, // [22] word_freq_000
  { min: 0, max: 12.5 }, // [23] word_freq_money
  { min: 0, max: 20.83 }, // [24] word_freq_hp
  { min: 0, max: 16.66 }, // [25] word_freq_hpl
  { min: 0, max: 33.33 }, // [26] word_freq_george
  { min: 0, max: 9.09 }, // [27] word_freq_650
  { min: 0, max: 14.28 }, // [28] word_freq_lab
  { min: 0, max: 5.88 }, // [29] word_freq_labs
  { min: 0, max: 12.5 }, // [30] word_freq_telnet
  { min: 0, max: 4.76 }, // [31] word_freq_857
  { min: 0, max: 18.18 }, // [32] word_freq_data
  { min: 0, max: 4.76 }, // [33] word_freq_415
  { min: 0, max: 20 }, // [34] word_freq_85
  { min: 0, max: 7.69 }, // [35] word_freq_technology
  { min: 0, max: 6.89 }, // [36] word_freq_1999
  { min: 0, max: 8.33 }, // [37] word_freq_parts
  { min: 0, max: 11.11 }, // [38] word_freq_pm
  { min: 0, max: 4.76 }, // [39] word_freq_direct
  { min: 0, max: 7.14 }, // [40] word_freq_cs
  { min: 0, max: 14.28 }, // [41] word_freq_meeting
  { min: 0, max: 3.57 }, // [42] word_freq_original
  { min: 0, max: 20 }, // [43] word_freq_project
  { min: 0, max: 21.42 }, // [44] word_freq_re
  { min: 0, max: 22.05 }, // [45] word_freq_edu
  { min: 0, max: 2.17 }, // [46] word_freq_table
  { min: 0, max: 10 }, // [47] word_freq_conference
  { min: 0, max: 4.385 }, // [48] char_freq_;
  { min: 0, max: 9.752 }, // [49] char_freq_(
  { min: 0, max: 4.081 }, // [50] char_freq_[
  { min: 0, max: 32.478 }, // [51] char_freq_!
  { min: 0, max: 6.003 }, // [52] char_freq_$
  { min: 0, max: 19.829 }, // [53] char_freq_#
  { min: 1, max: 1102.5 }, // [54] capital_run_length_average
  { min: 1, max: 9989 }, // [55] capital_run_length_longest
  { min: 1, max: 15841 }, // [56] capital_run_length_total
  { min: 0, max: 1 }, // [57] {spam: 1, ham: 0}
];

function getMin(i) {
  return statistics[i].min;
}

function getMax(i) {
  return statistics[i].max;
}

module.exports = { getMin, getMax };
