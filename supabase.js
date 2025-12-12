// supabase.js - Include in all HTML files
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    key: 'your-anon-key'
};

class ElectionDB {
    constructor() {
        this.supabase = window.supabase.createClient(
            SUPABASE_CONFIG.url, 
            SUPABASE_CONFIG.key
        );
    }
    
    async getCandidates(category = null) {
        let query = this.supabase
            .from('candidates')
            .select('*')
            .order('votes', { ascending: false });
        
        if (category) {
            query = query.eq('category', category);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
    }
    
    async vote(candidateId, voterEmail, voterName) {
        // Check if already voted
        const { data: existing } = await this.supabase
            .from('votes')
            .select('*')
            .eq('voter_email', voterEmail)
            .eq('candidate_id', candidateId)
            .single();
        
        if (existing) {
            throw new Error('Already voted for this candidate');
        }
        
        // Add vote
        const { error: voteError } = await this.supabase
            .from('votes')
            .insert([{
                candidate_id: candidateId,
                voter_email: voterEmail,
                voter_name: voterName
            }]);
        
        if (voteError) throw voteError;
        
        // Increment vote count
        const { error: updateError } = await this.supabase
            .rpc('increment_votes', { candidate_id: candidateId });
        
        if (updateError) throw updateError;
        
        return true;
    }
    
    async getStatistics() {
        const { data: candidates } = await this.getCandidates();
        const { data: votes } = await this.supabase
            .from('votes')
            .select('*');
        
        return {
            totalCandidates: candidates.length,
            totalVotes: votes.length,
            missCandidates: candidates.filter(c => c.category === 'miss').length,
            masterCandidates: candidates.filter(c => c.category === 'master').length
        };
    }
}

// Global instance
window.electionDB = new ElectionDB();