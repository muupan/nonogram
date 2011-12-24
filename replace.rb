str = open("nonogram.js").read

words = [
  "isPlaying",
  "selectedCell",
  "startPoint",
  "startCell",
  "startTime",
  "hasMoved",
  "isContinuousInputMode",
  "continuousInputStartCell",
  "continuousInputColor",
  "continuousInputModeTimeout"
]
words.each { |word|
  str.gsub!(word, "gameData." + word)
}
new_file = File.open("nonogram_new.js", "w")
new_file.print str
