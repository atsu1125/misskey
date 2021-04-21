#! /usr/bin/env perl

use strict;
use File::Find;

find({wanted => \&process, no_chdir => 1}, 'src/');

sub process {
	return unless /\.vue$/;

	print "$_\n";

	open my $FH, '<', $_ or die "$_ $!";
	my @inputs = <$FH>;
	close $FH;

	my @rs;
	my @ss;

	for my $input (@inputs) {
		if ($input =~ m|^import\s+{\s*([^}]+)\s*}\sfrom\s'\@fortawesome/free-solid-svg-icons'|) {
			@ss = grep { /^\w+$/ } map {s/\s+$//; $_} split(/,\s*/, $1);
			printf "  solid: %s\n", join('|', @ss) if @ss;
		}

		if ($input =~ m|^import\s+{\s*([^}]+)\s*}\sfrom\s'\@fortawesome/free-regular-svg-icons'|) {
			@rs = grep { /^\w+$/ } map {s/\s+$//; $_}  split(/,\s*/, $1);
			printf "  regular: %s\n", join('|', @rs) if @rs;
		}
	}

	my @outputs;
	for my $input (@inputs) {
		for my $from (@ss) {
			my $name = conv_case($from);
			$input =~ s|<fa :icon="$from"/>|<i class="fas $name"><i>|;
		}

		for my $from (@rs) {
			my $name = conv_case($from);
			$input =~ s|<fa :icon="$from"/>|<i class="far $name"><i>|;
		}

		push(@outputs, $input);
	}

	open my $FH, '>', $_ or die "$_ $!";
	for my $output (@outputs) {
		print $FH $output;
	}
	close $FH;
}

sub conv_case {
	my ($from) = @_;

	my $r = '';
	for my $c (split(//, $from)) {
		if ($c =~ /[A-Z]/) {
			$r .= "-" . lc($c);
		} else {
			$r .= $c;
		}
	}

	return $r;
}
