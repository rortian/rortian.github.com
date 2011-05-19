require 'rubygems'
require 'json'

files =  `ls *.json`.split

all = []

files.each do |name|
  f = File.new name
  buff = ""
  f.each_line {|l| buff << l }
  x = JSON.parse buff
  rep = {}
  rep['name'] =  x['name']
  rep['url'] = "http://www.atlanticworks.com/#{name}"
  all << rep
end

output = File.new 'networks.json','w'
output << all.to_json
output.close
