require 'rubygems'
require 'json'
require 'set'

file = File.new ARGV[0]
output = File.new "#{ARGV[0]}.json",'w'

links = []
entries = {}

file.each_line do |l|
  l = l[0..(l.size-2)]
  parts = l.split "\t"
  parts.each {|p| entries[p] = entries.size unless entries[p] }
  links << [entries[parts[0]],entries[parts[1]]]
end

j = {}
j['nodes'] = entries.keys
j['links'] = links
j['name'] = ARGV[1]

output << j.to_json
output.close
